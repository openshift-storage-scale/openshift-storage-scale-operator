package diskutils

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"k8s.io/klog/v2"

	"github.com/pkg/errors"
)

var (
	ExecCommand          CommandExecutor
	FilePathGlob         = filepath.Glob
	FilePathEvalSymLinks = filepath.EvalSymlinks
	mountFile            = "/proc/1/mountinfo"
)

func init() {
	ExecCommand = CmdExec{}
}

const (
	// StateSuspended is a possible value of BlockDevice.State
	StateSuspended = "suspended"
	// DiskByIDDir is the path for symlinks to the device by id.
	DiskByIDDir = "/dev/disk/by-id/"
	// DiskDMDir is the path for symlinks of device mapper disks (e.g. mpath)
	DiskDMDir = "/dev/mapper/"
)

type CommandExecutor interface {
	Execute(name string, args ...string) Command
}

type CmdExec struct {
}

func (c CmdExec) Execute(name string, args ...string) Command {
	return exec.Command(name, args...)
}

type Command interface {
	CombinedOutput() ([]byte, error)
}

// IDPathNotFoundError indicates that a symlink to the device was not found in /dev/disk/by-id/
type IDPathNotFoundError struct {
	DeviceName string
}

func (e IDPathNotFoundError) Error() string {
	return fmt.Sprintf("IDPathNotFoundError: a symlink to  %q was not found in %q", e.DeviceName, DiskByIDDir)
}

// BlockDevice is the a block device as output by lsblk.
// All the fields are lsblk columns.

type BlockDeviceList struct {
	BlockDevices []BlockDevice `json:"blockdevices"`
}

type BlockDevice struct {
	Name       string        `json:"name"`
	Rotational bool          `json:"rota"`
	Type       string        `json:"type"`
	Size       int64         `json:"size"`
	Model      string        `json:"model,omitempty"`
	Vendor     string        `json:"vendor,omitempty"`
	ReadOnly   bool          `json:"RO,omitempty"`
	Removable  bool          `json:"RM,omitempty"`
	State      string        `json:"state,omitempty"`
	KName      string        `json:"kname"`
	FSType     string        `json:"fstype,omitempty"`
	Serial     string        `json:"serial,omitempty"`
	PartLabel  string        `json:"partlabel,omitempty"`
	PathByID   string        `json:"pathByID,omitempty"` // Fetched from introspecting /dev
	WWN        string        `json:"WWN,omitempty"`      // Purple unicorn storage fields
	Children   []BlockDevice `json:"children,omitempty"`
}

// HasBindMounts checks for bind mounts and returns mount point for a device by parsing `proc/1/mountinfo`.
// HostPID should be set to true inside the POD spec to get details of host's mount points inside `proc/1/mountinfo`.
func (b *BlockDevice) HasBindMounts() (mountpoint string, err error) {
	data, err := os.ReadFile(mountFile)
	if err != nil {
		return "", fmt.Errorf("failed to read file %s: %v", mountFile, err)
	}

	mountString := string(data)
	for _, mountInfo := range strings.Split(mountString, "\n") {
		if strings.Contains(mountInfo, b.KName) {
			mountInfoList := strings.Split(mountInfo, " ")
			if len(mountInfoList) >= 10 {
				// device source is 4th field for bind mounts and 10th for regular mounts
				if mountInfoList[3] == fmt.Sprintf("/%s", b.KName) || mountInfoList[9] == fmt.Sprintf("/dev/%s", b.KName) {
					return mountInfoList[4], nil
				}
			}
		}
	}

	return "", nil
}

// GetDevPath for block device (/dev/sdx)
func (b *BlockDevice) GetDevPath() (path string, err error) {
	if b.KName == "" {
		return "", fmt.Errorf("empty KNAME")
	}
	return fmt.Sprintf("/dev/%s", b.KName), nil
}

// GetPathByID check on BlockDevice
func (b *BlockDevice) GetPathByID(existingDeviceID string) (string, error) {
	// return if previously populated value is valid
	if b.PathByID != "" && strings.HasPrefix(b.PathByID, DiskByIDDir) {
		evalsCorrectly, err := PathEvalsToDiskLabel(b.PathByID, b.KName)
		if err == nil && evalsCorrectly {
			return b.PathByID, nil
		}
	}
	b.PathByID = ""
	allDisks, err := FilePathGlob(filepath.Join(DiskByIDDir, "*"))
	if err != nil {
		return "", fmt.Errorf("error listing files in %s: %v", DiskByIDDir, err)
	}
	preferredPatterns := []string{"wwn", "scsi", "nvme", ""}

	// sortedSymlinks sorts symlinks in 4 buckets.
	// 	- [0] - syminks that match wwn
	//	- [1] - symlinks that match scsi
	//	- [2] - symlinks that match nvme
	//	- [3] - symlinks that does not any of these
	sortedSymlinks := make([][]string, len(preferredPatterns))

	for _, path := range allDisks {
		symLinkName := filepath.Base(path)
		if existingDeviceID != "" && symLinkName == existingDeviceID {
			isMatch, err := PathEvalsToDiskLabel(path, b.KName)
			if err != nil {
				return "", err
			}
			if isMatch {
				b.PathByID = path
				return path, nil
			}
		}

		for i, pattern := range preferredPatterns {
			if strings.HasPrefix(symLinkName, pattern) {
				sortedSymlinks[i] = append(sortedSymlinks[i], path)
				break
			}
		}
	}

	for _, groupedLink := range sortedSymlinks {
		for _, path := range groupedLink {
			isMatch, err := PathEvalsToDiskLabel(path, b.KName)
			if err != nil {
				return "", err
			}
			if isMatch {
				b.PathByID = path
				return path, nil
			}
		}
	}

	devPath, err := b.GetDevPath()
	if err != nil {
		return "", err
	}
	// return path by label and error
	return devPath, IDPathNotFoundError{DeviceName: b.KName}
}

// PathEvalsToDiskLabel checks if the path is a symplink to a file devName
func PathEvalsToDiskLabel(path, devName string) (bool, error) {
	devPath, err := FilePathEvalSymLinks(path)
	if err != nil {
		if os.IsNotExist(err) {
			return false, nil
		}
		return false, fmt.Errorf("could not eval symLink %q:%w", devPath, err)
	}
	if filepath.Base(devPath) == devName {
		return true, nil
	}
	return false, nil
}

// ListBlockDevices using the lsblk command
func ListBlockDevices(devices []string) (blockDevices, badRows []BlockDevice, err error) {
	deviceFSMap, err := GetDeviceFSMap(devices)
	if err != nil {
		return []BlockDevice{}, []BlockDevice{}, errors.Wrap(err, "failed to list block devices")
	}

	columns := "NAME,ROTA,TYPE,SIZE,MODEL,VENDOR,RO,RM,STATE,KNAME,SERIAL,PARTLABEL,WWN"
	args := []string{"--json", "-b", "-o", columns}
	cmd := ExecCommand.Execute("lsblk", args...)
	klog.Infof("Executing command: %#v", cmd)
	output, err := executeCmdWithCombinedOutput(cmd)
	if err != nil {
		return []BlockDevice{}, []BlockDevice{}, fmt.Errorf("failed to run command: %s", err)
	}
	if output == "" {
		return []BlockDevice{}, []BlockDevice{}, nil
	}
	lDevices := BlockDeviceList{}
	err = json.Unmarshal([]byte(output), &lDevices)
	if err != nil {
		return []BlockDevice{}, []BlockDevice{}, fmt.Errorf("failed to unmarshal JSON %s: %s", output, err)
	}

	for idx := range lDevices.BlockDevices {
		// only use device if name is populated, and non-empty
		if strings.Trim(lDevices.BlockDevices[idx].Name, " ") == "" {
			badRows = append(badRows, lDevices.BlockDevices[idx])
			e, err := json.Marshal(badRows)
			m := fmt.Sprintf("Found an entry with empty name: %s.", e)
			if err != nil {
				m = fmt.Sprintf(m+" Failed to marshal ", err)
			}
			klog.Warning(m)
			break
		}

		row.Model = strings.Trim(row.Model, " ")
		row.Vendor = strings.Trim(row.Vendor, " ")
		// Update device filesystem using `blkid`
		if fs, ok := deviceFSMap[fmt.Sprintf("/dev/%s", row.Name)]; ok {
			row.FSType = fs
		}
		blockDevices = append(blockDevices, row)
	}

	if len(badRows) == len(lDevices.BlockDevices) && len(lDevices.BlockDevices) > 0 {
		return []BlockDevice{}, badRows, fmt.Errorf("could not parse any of the lsblk entries")
	}

	return blockDevices, badRows, nil
}

// GetDeviceFSMap returns mapping between disks and the filesystem using blkid
// It parses the output of `blkid -s TYPE`. Sample output format before parsing
// `/dev/sdc: TYPE="ext4"
// /dev/sdd: TYPE="ext2"`
// If devices is empty, it scans all disks, otherwise only devices.
func GetDeviceFSMap(devices []string) (map[string]string, error) {
	m := map[string]string{}
	args := append([]string{"-s", "TYPE"}, devices...)
	cmd := ExecCommand.Execute("blkid", args...)
	output, err := executeCmdWithCombinedOutput(cmd)
	if err != nil {
		// According to blkid man page, exit status 2 is returned
		// if no device found.
		if exiterr, ok := err.(*exec.ExitError); ok {
			if exiterr.ExitCode() == 2 {
				return map[string]string{}, nil
			}
		}
		return map[string]string{}, err
	}
	lines := strings.Split(output, "\n")
	for _, l := range lines {
		if l == "" {
			// Ignore empty line.
			continue
		}

		values := strings.Split(l, ":")
		if len(values) != 2 {
			continue
		}

		fs := strings.Split(values[1], "=")
		if len(fs) != 2 {
			continue
		}

		m[values[0]] = strings.Trim(strings.TrimSpace(fs[1]), "\"")
	}

	return m, nil
}

func executeCmdWithCombinedOutput(cmd Command) (string, error) {
	output, err := cmd.CombinedOutput()
	if err != nil {
		return string(output), err
	}
	return strings.TrimSpace(string(output)), nil
}
