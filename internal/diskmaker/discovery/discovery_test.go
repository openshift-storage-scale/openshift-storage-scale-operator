//nolint:lll,dupl
package discovery

import (
	"fmt"
	"os"
	"path/filepath"
	"testing"

	"github.com/validatedpatterns/openshift-storage-scale-operator/api/v1alpha1"
	"github.com/validatedpatterns/openshift-storage-scale-operator/internal/diskutils"

	"github.com/stretchr/testify/assert"
	"github.com/validatedpatterns/openshift-storage-scale-operator/internal/diskmaker"
)

var lsblkOut string
var blkidOut string

type mockCmdExec struct {
	stdout []string
	count  int
}

func (m *mockCmdExec) Execute(name string, args ...string) diskutils.Command {
	return m
}

func (m *mockCmdExec) CombinedOutput() ([]byte, error) {
	o := m.stdout[m.count]
	m.count++
	return []byte(o), nil
}

func TestHelperProcess(t *testing.T) {
	if os.Getenv("GO_WANT_HELPER_PROCESS") != "1" {
		return
	}

	defer os.Exit(0)
	switch os.Getenv("COMMAND") {
	case "lsblk":
		fmt.Fprint(os.Stdout, os.Getenv("LSBLKOUT"))
	case "blkid":
		fmt.Fprint(os.Stdout, os.Getenv("BLKIDOUT"))
	}
}

func TestIgnoreDevices(t *testing.T) {
	testcases := []struct {
		label        string
		blockDevice  diskutils.BlockDevice
		fakeGlobfunc func(string) ([]string, error)
		expected     bool
		errMessage   error
	}{
		{
			label: "don't ignore disk type",
			blockDevice: diskutils.BlockDevice{
				Name:     "sdb",
				KName:    "sdb",
				ReadOnly: false,
				State:    "running",
				Type:     "disk",
				WWN:      "a",
			},
			fakeGlobfunc: func(name string) ([]string, error) {
				return []string{"removable", "subsytem"}, nil
			},
			expected:   false,
			errMessage: fmt.Errorf("ignored wrong device"),
		},
		{
			label: "ignore lvm type",
			blockDevice: diskutils.BlockDevice{
				Name:     "sdb",
				KName:    "sdb",
				ReadOnly: false,
				State:    "running",
				Type:     "lvm",
				WWN:      "a",
			},
			fakeGlobfunc: func(name string) ([]string, error) {
				return []string{"removable", "subsytem"}, nil
			},
			expected:   true,
			errMessage: fmt.Errorf("ignored wrong device"),
		},
		{
			label: "don't ignore mpath type",
			blockDevice: diskutils.BlockDevice{
				Name:     "sdc",
				KName:    "dm-0",
				ReadOnly: false,
				State:    "running",
				Type:     "mpath",
				WWN:      "a",
			},
			fakeGlobfunc: func(name string) ([]string, error) {
				return []string{"removable", "subsytem"}, nil
			},
			expected:   false,
			errMessage: fmt.Errorf("ignored wrong device"),
		},
		{
			label: "ignore read only devices",
			blockDevice: diskutils.BlockDevice{
				Name:     "sdb",
				KName:    "sdb",
				ReadOnly: true,
				State:    "running",
				Type:     "disk",
				WWN:      "a",
			},
			fakeGlobfunc: func(name string) ([]string, error) {
				return []string{"removable", "subsytem"}, nil
			},
			expected:   true,
			errMessage: fmt.Errorf("failed to ignore read only device"),
		},
		{
			label: "ignore devices in suspended state",
			blockDevice: diskutils.BlockDevice{
				Name:     "sdb",
				KName:    "sdb",
				ReadOnly: false,
				State:    "suspended",
				Type:     "disk",
				WWN:      "a",
			},
			fakeGlobfunc: func(name string) ([]string, error) {
				return []string{"removable", "subsytem"}, nil
			},
			expected:   true,
			errMessage: fmt.Errorf("ignored wrong suspended device"),
		},
		{
			label: "don't ignore device with children",
			blockDevice: diskutils.BlockDevice{
				Name:     "sdb",
				KName:    "sdb",
				ReadOnly: false,
				State:    "running",
				Type:     "disk",
				Children: []diskutils.BlockDevice{
					{Name: "sdb1", KName: "sdb1"},
				},
				WWN: "a",
			},
			fakeGlobfunc: func(name string) ([]string, error) {
				return []string{"removable", "subsytem", "sdb"}, nil
			},
			expected:   false,
			errMessage: fmt.Errorf("ignored device with children"),
		},
		{
			label: "ignore removable device",
			blockDevice: diskutils.BlockDevice{
				Name:      "sdb",
				KName:     "sdb",
				ReadOnly:  false,
				State:     "running",
				Type:      "disk",
				Removable: true,
				WWN:       "a",
			},
			fakeGlobfunc: func(name string) ([]string, error) {
				return []string{"removable", "subsytem", "sdb"}, nil
			},
			expected:   true,
			errMessage: fmt.Errorf("failed to ignore removable device"),
		},
		{
			label: "ignore disk without WWN",
			blockDevice: diskutils.BlockDevice{
				Name:      "sda",
				KName:     "sda",
				ReadOnly:  false,
				State:     "running",
				Type:      "disk",
				Removable: false,
			},
			fakeGlobfunc: func(name string) ([]string, error) {
				return []string{"removable", "subsytem", "sdb"}, nil
			},
			expected:   true,
			errMessage: fmt.Errorf("failed to ignore device without WWN"),
		},
	}

	for _, tc := range testcases {
		diskutils.FilePathGlob = tc.fakeGlobfunc
		defer func() {
			diskutils.FilePathGlob = filepath.Glob
		}()

		actual := ignoreDevices(tc.blockDevice)
		assert.Equalf(t, tc.expected, actual, "[%s]: %s", tc.label, tc.errMessage)
	}
}

func TestValidBlockDevices(t *testing.T) {
	testcases := []struct {
		label                        string
		blockDevices                 []diskutils.BlockDevice
		fakeLsblkCmdOutput           string
		fakeblkidCmdOutput           string
		fakeGlobfunc                 func(string) ([]string, error)
		expectedDiscoveredDeviceSize int
		errMessage                   error
	}{
		{
			label:              "Case 1: ignore readonly device sda",
			fakeblkidCmdOutput: "",
			fakeLsblkCmdOutput: `{"blockdevices": [
				{"name": "sda", "rota": true, "type": "disk", "size": 480103981056, "model": "MTFDDAK480TDS   ", "vendor": "ATA     ", "ro": true, "rm": false, "state": "running", "kname": "sda", "serial": "20442B9F5254", "partlabel": null, "wwn": "0x500a07512b9f5254"},
				{"name": "sdb", "rota": true, "type": "disk", "size": 3840755982336, "model": "SSDSC2KB038TZR  ", "vendor": "ATA     ", "ro": false, "rm": false, "state": "running", "kname": "sda1", "serial": "PHYI313002K23P8EGN", "partlabel": null, "wwn": "0x55cd2e41563851e9"}]}`,
			fakeGlobfunc: func(name string) ([]string, error) {
				return []string{"removable", "subsytem"}, nil
			},
			expectedDiscoveredDeviceSize: 1,
			errMessage:                   fmt.Errorf("failed to ignore readonly device sda"),
		},
		{
			label:              "Case 2: ignore root device sda",
			fakeblkidCmdOutput: "",
			fakeLsblkCmdOutput: `{"blockdevices": [
      {"name": "sda", "rota": false, "type": "mpath", "size": 480103981056, "model": "MTFDDAK480TDS   ", "vendor": "ATA     ", "ro": false, "rm": false, "state": "running", "kname": "sda", "serial": "20442B9F5254", "partlabel": null, "wwn": null,
         "children": [
            {"name": "sda1", "rota": false, "type": "part", "size": 1073741824, "model": null, "vendor": null, "ro": false, "rm": false, "state": null, "kname": "sda1", "serial": null, "partlabel": null, "wwn": ""}
		]
      },
      {"name": "sdb", "rota": false, "type": "mpath", "size": 3840755982336, "model": "SSDSC2KB038TZR  ", "vendor": "ATA     ", "ro": false, "rm": false, "state": "running", "kname": "sdb", "serial": "PHYI313002K23P8EGN", "partlabel": null, "wwn": "0x55cd2e41563851e9"}]}`,
			fakeGlobfunc: func(name string) ([]string, error) {
				return []string{"removable", "subsytem", "sda"}, nil
			},
			expectedDiscoveredDeviceSize: 1,
			errMessage:                   fmt.Errorf("failed to ignore root device sda with partition"),
		},
		{
			label:              "Case 3: ignore invalid device types: loop, lvm, cdrom",
			fakeblkidCmdOutput: "",
			fakeLsblkCmdOutput: `{"blockdevices": [
				{"name": "sda", "rota": true, "type": "loop", "size": 480103981056, "model": "MTFDDAK480TDS   ", "vendor": "ATA     ", "ro": false, "rm": false, "state": "running", "kname": "sda", "serial": "20442B9F5254", "partlabel": null, "wwn": "0x500a07512b9f5254"},
				{"name": "sdb", "rota": true, "type": "disk", "size": 480103981056, "model": "MTFDDAK480TDS   ", "vendor": "ATA     ", "ro": false, "rm": false, "state": "running", "kname": "sdb", "serial": "20442B9F5254", "partlabel": null, "wwn": "0x500a07512b9f5254"},
				{"name": "sdc", "rota": true, "type": "cdrom", "size": 480103981056, "model": "MTFDDAK480TDS   ", "vendor": "ATA     ", "ro": false, "rm": false, "state": "running", "kname": "sdc", "serial": "20442B9F5254", "partlabel": null, "wwn": "0x500a07512b9f5254"},
				{"name": "sdd", "rota": true, "type": "lvm", "size": 480103981056, "model": "MTFDDAK480TDS   ", "vendor": "ATA     ", "ro": false, "rm": false, "state": "running", "kname": "sdd", "serial": "20442B9F5254", "partlabel": null, "wwn": "0x500a07512b9f5254"},
				{"name": "sde", "rota": true, "type": "mpath", "size": 3840755982336, "model": "SSDSC2KB038TZR  ", "vendor": "ATA     ", "ro": false, "rm": false, "state": "running", "kname": "sda1", "serial": "PHYI313002K23P8EGN", "partlabel": null, "wwn": "0x55cd2e41563851e9"}]}`,

			fakeGlobfunc: func(name string) ([]string, error) {
				return []string{"removable", "subsytem"}, nil
			},
			expectedDiscoveredDeviceSize: 2,
			errMessage:                   fmt.Errorf("failed to ignore device sda with type loop"),
		},
		{
			label:              "Case 4: ignore device is suspended state",
			fakeblkidCmdOutput: "",
			fakeLsblkCmdOutput: `{"blockdevices": [
				{"name": "sda", "rota": true, "type": "disk", "size": 480103981056, "model": "MTFDDAK480TDS   ", "vendor": "ATA     ", "ro": false, "rm": false, "state": "running", "kname": "sda", "serial": "20442B9F5254", "partlabel": null, "wwn": "0x500a07512b9f5254"},
				{"name": "sdb", "rota": true, "type": "disk", "size": 3840755982336, "model": "SSDSC2KB038TZR  ", "vendor": "ATA     ", "ro": false, "rm": false, "state": "suspended", "kname": "sda1", "serial": "PHYI313002K23P8EGN", "partlabel": null, "wwn": "0x55cd2e41563851e9"}]}`,
			fakeGlobfunc: func(name string) ([]string, error) {
				return []string{"removable", "subsytem"}, nil
			},
			expectedDiscoveredDeviceSize: 1,
			errMessage:                   fmt.Errorf("failed to ignore device sda1 in suspended state"),
		},
		{
			label:              "Case 4: ignore device with removable storage",
			fakeblkidCmdOutput: "",
			fakeLsblkCmdOutput: `{"blockdevices": [
				{"name": "sda", "rota": true, "type": "disk", "size": 480103981056, "model": "MTFDDAK480TDS   ", "vendor": "ATA     ", "ro": false, "rm": false, "state": "running", "kname": "sda", "serial": "20442B9F5254", "partlabel": null, "wwn": "0x500a07512b9f5254"},
				{"name": "sdb", "rota": true, "type": "disk", "size": 3840755982336, "model": "SSDSC2KB038TZR  ", "vendor": "ATA     ", "ro": false, "rm": true, "state": "running", "kname": "sda1", "serial": "PHYI313002K23P8EGN", "partlabel": null, "wwn": "0x55cd2e41563851e9"}]}`,
			fakeGlobfunc: func(name string) ([]string, error) {
				return []string{"removable", "subsytem"}, nil
			},
			expectedDiscoveredDeviceSize: 1,
			errMessage:                   fmt.Errorf("failed to ignore device sda1 in suspended state"),
		},
	}

	for _, tc := range testcases {
		lsblkOut = tc.fakeLsblkCmdOutput
		blkidOut = tc.fakeblkidCmdOutput
		m := &mockCmdExec{stdout: []string{blkidOut, lsblkOut}}
		diskutils.ExecCommand = m
		diskutils.FilePathGlob = tc.fakeGlobfunc
		actual, err := getValidBlockDevices()
		assert.NoError(t, err, "[%s]:", tc.label)
		assert.Equalf(t, tc.expectedDiscoveredDeviceSize, len(actual), "[%s]: %s", tc.label, tc.errMessage)
	}
}

func TestGetDiscoveredDevices(t *testing.T) {
	testcases := []struct {
		label               string
		blockDevices        []diskutils.BlockDevice
		expected            []v1alpha1.DiscoveredDevice
		fakeGlobfunc        func(string) ([]string, error)
		fakeEvalSymlinkfunc func(string) (string, error)
	}{
		{
			label: "Case 1: discovering device with fstype as NotAvailable",
			blockDevices: []diskutils.BlockDevice{
				{
					Name:       "sdb",
					KName:      "sdb",
					FSType:     "ext4",
					Type:       "disk",
					Size:       62914560000,
					Model:      "VBOX HARDDISK",
					Vendor:     "ATA",
					Serial:     "DEVICE_SERIAL_NUMBER",
					Rotational: true,
					ReadOnly:   false,
					Removable:  false,
					State:      "running",
					WWN:        "aff-bcdd",
				},
			},
			expected: []v1alpha1.DiscoveredDevice{
				{
					DeviceID: "/dev/disk/by-id/sdb",
					Path:     "/dev/sdb",
					Model:    "VBOX HARDDISK",
					Type:     "disk",
					Vendor:   "ATA",
					Serial:   "DEVICE_SERIAL_NUMBER",
					Size:     int64(62914560000),
					Property: "Rotational",
					FSType:   "ext4",
					Status:   v1alpha1.DeviceStatus{State: "NotAvailable"},
					WWN:      "aff-bcdd",
				},
			},
			fakeGlobfunc: func(name string) ([]string, error) {
				return []string{"/dev/disk/by-id/sdb"}, nil
			},
			fakeEvalSymlinkfunc: func(path string) (string, error) {
				return "/dev/disk/by-id/sdb", nil
			},
		},

		{
			label: "Case 2: discovering device with fstype as NotAvailable",
			blockDevices: []diskutils.BlockDevice{
				{
					Name:       "sda1",
					KName:      "sda1",
					FSType:     "ext4",
					Type:       "part",
					Size:       62913494528,
					Model:      "",
					Vendor:     "",
					Serial:     "",
					Rotational: false,
					ReadOnly:   false,
					Removable:  false,
					State:      "running",
				},
			},
			expected: []v1alpha1.DiscoveredDevice{
				{
					DeviceID: "/dev/disk/by-id/sda1",
					Path:     "/dev/sda1",
					Model:    "",
					Type:     "part",
					Vendor:   "",
					Serial:   "",
					Size:     int64(62913494528),
					Property: "NonRotational",
					FSType:   "ext4",
					Status:   v1alpha1.DeviceStatus{State: "NotAvailable"},
				},
			},
			fakeGlobfunc: func(name string) ([]string, error) {
				return []string{"/dev/disk/by-id/sda1"}, nil
			},
			fakeEvalSymlinkfunc: func(path string) (string, error) {
				return "/dev/disk/by-id/sda1", nil
			},
		},
		{
			label: "Case 3: discovering device with BIOS-BOOT part-label as NotAvailable",
			blockDevices: []diskutils.BlockDevice{
				{
					Name:       "sda1",
					KName:      "sda1",
					FSType:     "",
					Type:       "part",
					Size:       62913494528,
					Model:      "",
					Vendor:     "",
					Serial:     "",
					Rotational: false,
					ReadOnly:   false,
					Removable:  false,
					State:      "running",
					PartLabel:  "BIOS-BOOT",
				},
			},
			expected: []v1alpha1.DiscoveredDevice{
				{
					DeviceID: "/dev/disk/by-id/sda1",
					Path:     "/dev/sda1",
					Model:    "",
					Type:     "part",
					Vendor:   "",
					Serial:   "",
					Size:     int64(62913494528),
					Property: "NonRotational",
					FSType:   "",
					Status:   v1alpha1.DeviceStatus{State: "NotAvailable"},
				},
			},
			fakeGlobfunc: func(name string) ([]string, error) {
				return []string{"/dev/disk/by-id/sda1"}, nil
			},
			fakeEvalSymlinkfunc: func(path string) (string, error) {
				return "/dev/disk/by-id/sda1", nil
			},
		},
		{
			label: "Case 4: discovering device with vfat fstype as NotAvailable",
			blockDevices: []diskutils.BlockDevice{
				{
					Name:       "sda1",
					KName:      "sda1",
					FSType:     "vfat",
					Type:       "part",
					Size:       62913494528,
					Model:      "",
					Vendor:     "",
					Serial:     "",
					Rotational: false,
					ReadOnly:   false,
					Removable:  false,
					State:      "running",
					PartLabel:  "EFI-SYSTEM",
				},
			},
			expected: []v1alpha1.DiscoveredDevice{
				{
					DeviceID: "/dev/disk/by-id/sda1",
					Path:     "/dev/sda1",
					Model:    "",
					Type:     "part",
					Vendor:   "",
					Serial:   "",
					Size:     int64(62913494528),
					Property: "NonRotational",
					FSType:   "vfat",
					Status:   v1alpha1.DeviceStatus{State: "NotAvailable"},
				},
			},
			fakeGlobfunc: func(name string) ([]string, error) {
				return []string{"/dev/disk/by-id/sda1"}, nil
			},
			fakeEvalSymlinkfunc: func(path string) (string, error) {
				return "/dev/disk/by-id/sda1", nil
			},
		},
		{
			label: "Case 5: discovering multipath device",
			blockDevices: []diskutils.BlockDevice{
				{
					Name:       "sda",
					KName:      "dm-0",
					FSType:     "",
					Type:       "mpath",
					Size:       62913494528,
					Model:      "",
					Vendor:     "",
					Serial:     "",
					Rotational: false,
					ReadOnly:   false,
					Removable:  false,
					State:      "running",
					PartLabel:  "",
					// We're faking glob function in these test cases and this test would do globbing twice
					// (first for getting by-id path and second for /dev/mapper path) so we pretend the by-id path is already set.
					// That way we can test only /dev/mapper globbing and symlink evaluation.
					PathByID: "/dev/disk/by-id/dm-name-mpatha",
					WWN:      "mpathID",
				},
			},
			expected: []v1alpha1.DiscoveredDevice{
				{
					DeviceID: "/dev/disk/by-id/dm-name-mpatha",
					Path:     "/dev/dm-0",
					Model:    "",
					Type:     "mpath",
					Vendor:   "",
					Serial:   "",
					Size:     int64(62913494528),
					Property: "NonRotational",
					FSType:   "",
					Status:   v1alpha1.DeviceStatus{State: v1alpha1.Unknown},
					WWN:      "mpathID",
				},
			},
			fakeGlobfunc: func(name string) ([]string, error) {
				return []string{"/dev/mapper/mpatha"}, nil
			},
			fakeEvalSymlinkfunc: func(path string) (string, error) {
				return "/dev/dm-0", nil
			},
		},
		{
			label: "Case 6: discovery result shows only unique devices by-id",
			blockDevices: []diskutils.BlockDevice{
				{
					Name:       "mpatha",
					KName:      "dm-0",
					FSType:     "",
					Type:       "mpath",
					Size:       62913494528,
					Model:      "",
					Vendor:     "",
					Serial:     "",
					Rotational: false,
					ReadOnly:   false,
					Removable:  false,
					State:      "running",
					PartLabel:  "",
					PathByID:   "/dev/disk/by-id/dm-name-mpatha",
					WWN:        "a",
				},
				{
					Name:       "mpatha",
					KName:      "dm-0",
					FSType:     "",
					Type:       "mpath",
					Size:       62913494528,
					Model:      "",
					Vendor:     "",
					Serial:     "",
					Rotational: false,
					ReadOnly:   false,
					Removable:  false,
					State:      "running",
					PartLabel:  "",
					PathByID:   "/dev/disk/by-id/dm-name-mpatha",
					WWN:        "a",
				},
			},
			expected: []v1alpha1.DiscoveredDevice{
				{
					DeviceID: "/dev/disk/by-id/dm-name-mpatha",
					Path:     "/dev/dm-0",
					Model:    "",
					Type:     "mpath",
					Vendor:   "",
					Serial:   "",
					Size:     int64(62913494528),
					Property: "NonRotational",
					FSType:   "",
					Status:   v1alpha1.DeviceStatus{State: v1alpha1.Unknown},
					WWN:      "a",
				},
			},
			fakeGlobfunc: func(name string) ([]string, error) {
				return []string{"/dev/mapper/mpatha"}, nil
			},
			fakeEvalSymlinkfunc: func(path string) (string, error) {
				return "/dev/dm-0", nil
			},
		},
	}

	for _, tc := range testcases {
		diskutils.FilePathGlob = tc.fakeGlobfunc
		diskutils.FilePathEvalSymLinks = tc.fakeEvalSymlinkfunc
		defer func() {
			diskutils.FilePathGlob = filepath.Glob
			diskutils.FilePathEvalSymLinks = filepath.EvalSymlinks
		}()

		actual := getDiscoverdDevices(tc.blockDevices)

		if !assert.Equalf(t, len(tc.expected), len(actual), "Expected discovered device count: %v, but got: %v ", len(tc.expected), len(actual)) {
			t.Errorf("\nExpected:\n%#v\nGot:\n%#v", tc.expected, actual)
		}

		for i := 0; i < len(tc.expected); i++ {
			assert.Equalf(t, tc.expected[i].DeviceID, actual[i].DeviceID, "[%s: Discovered Device: %d]: invalid device ID", tc.label, i+1)
			assert.Equalf(t, tc.expected[i].Path, actual[i].Path, "[%s: Discovered Device: %d]: invalid device path", tc.label, i+1)
			assert.Equalf(t, tc.expected[i].Model, actual[i].Model, "[%s: Discovered Device: %d]: invalid device model", tc.label, i+1)
			assert.Equalf(t, tc.expected[i].Type, actual[i].Type, "[%s: Discovered Device: %d]: invalid device type", tc.label, i+1)
			assert.Equalf(t, tc.expected[i].Vendor, actual[i].Vendor, "[%s: Discovered Device: %d]: invalid device vendor", tc.label, i+1)
			assert.Equalf(t, tc.expected[i].Serial, actual[i].Serial, "[%s: Discovered Device: %d]: invalid device serial", tc.label, i+1)
			assert.Equalf(t, tc.expected[i].Size, actual[i].Size, "[%s: Discovered Device: %d]: invalid device size", tc.label, i+1)
			assert.Equalf(t, tc.expected[i].Property, actual[i].Property, "[%s: Discovered Device: %d]: invalid device property", tc.label, i+1)
			assert.Equalf(t, tc.expected[i].FSType, actual[i].FSType, "[%s: Discovered Device: %d]: invalid device filesystem", tc.label, i+1)
			assert.Equalf(t, tc.expected[i].Status, actual[i].Status, "[%s: Discovered Device: %d]: invalid device status", tc.label, i+1)
			assert.Equalf(t, tc.expected[i].WWN, actual[i].WWN, "[%s: Discovered Device: %d]: invalid WWN status", tc.label, i+1)
		}
	}
}

func TestParseDeviceType(t *testing.T) {
	testcases := []struct {
		label    string
		input    string
		expected v1alpha1.DiscoveredDeviceType
	}{
		{
			label:    "Case 1: disk type",
			input:    "disk",
			expected: v1alpha1.DiskType,
		},
		{
			label:    "Case 2: part type",
			input:    "part",
			expected: v1alpha1.PartType,
		},
		{
			label:    "Case 3: lvm type",
			input:    "lvm",
			expected: v1alpha1.LVMType,
		},
		{
			label:    "Case 4: loop device type",
			input:    "loop",
			expected: "",
		},
	}

	for _, tc := range testcases {
		actual := parseDeviceType(tc.input)
		assert.Equalf(t, tc.expected, actual, "[%s]: failed to parse device type", tc.label)
	}
}

func TestParseDeviceProperty(t *testing.T) {
	testcases := []struct {
		label    string
		input    bool
		expected v1alpha1.DeviceMechanicalProperty
	}{
		{
			label:    "Case 1: rotational device",
			input:    true,
			expected: v1alpha1.Rotational,
		},
		{
			label:    "Case 2: non-rotational device",
			input:    false,
			expected: v1alpha1.NonRotational,
		},
	}

	for _, tc := range testcases {
		actual := parseDeviceProperty(tc.input)
		assert.Equalf(t, tc.expected, actual, "[%s]: failed to parse device mechanical property", tc.label)
	}
}

func getFakeDeviceDiscovery() *DeviceDiscovery {
	dd := &DeviceDiscovery{}
	dd.apiClient = &diskmaker.MockAPIUpdater{}
	dd.eventSync = diskmaker.NewEventReporter(dd.apiClient)
	dd.disks = []v1alpha1.DiscoveredDevice{}
	dd.localVolumeDiscovery = &v1alpha1.LocalVolumeDiscovery{}

	return dd
}

func setEnv() {
	os.Setenv("MY_NODE_NAME", "node1")
	os.Setenv("WATCH_NAMESPACE", "ns")
	os.Setenv("DISCOVERY_OBJECT_UID", "uid")
	os.Setenv("DISCOVERY_OBJECT_NAME", "auto-discover-devices")
}

func unsetEnv() {
	os.Unsetenv("MY_NODE_NAME")
	os.Unsetenv("WATCH_NAMESPACE")
	os.Unsetenv("DISCOVERY_OBJECT_UID")
	os.Unsetenv("DISCOVERY_OBJECT_NAME")
}
