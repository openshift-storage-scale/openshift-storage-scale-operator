package discovery

import (
	"fmt"
	"os"
	"os/signal"
	"reflect"
	"strings"
	"syscall"
	"time"

	"github.com/openshift-storage-scale/openshift-storage-scale-operator/api/v1alpha1"
	"github.com/openshift-storage-scale/openshift-storage-scale-operator/internal/diskmaker"
	diskutil "github.com/openshift-storage-scale/openshift-storage-scale-operator/internal/diskutils"

	"github.com/pkg/errors"
	"k8s.io/apimachinery/pkg/util/sets"
	"k8s.io/client-go/kubernetes/scheme"
	"k8s.io/klog/v2"
)

const (
	localVolumeDiscoveryComponent = "auto-discover-devices"
	udevEventPeriod               = 5 * time.Second
	probeInterval                 = 5 * time.Minute
	resultCRName                  = "discovery-result-%s"
)

var supportedDeviceTypes = sets.NewString("mpath", "disk")

// DeviceDiscovery instance
type DeviceDiscovery struct {
	apiClient            diskmaker.ApiUpdater
	eventSync            *diskmaker.EventReporter
	disks                []v1alpha1.DiscoveredDevice
	localVolumeDiscovery *v1alpha1.LocalVolumeDiscovery
}

// NewDeviceDiscovery returns a new DeviceDiscovery instance
func NewDeviceDiscovery() (*DeviceDiscovery, error) {
	scheme := scheme.Scheme
	err := v1alpha1.AddToScheme(scheme)
	if err != nil {
		klog.Error(err, "failed to add scheme")
		return nil, err
	}

	apiUpdater, err := diskmaker.NewAPIUpdater(scheme)
	if err != nil {
		klog.Error(err, "failed to create new APIUpdater")
		return &DeviceDiscovery{}, err
	}

	dd := &DeviceDiscovery{}
	dd.apiClient = apiUpdater
	dd.eventSync = diskmaker.NewEventReporter(dd.apiClient)
	lvd, err := dd.apiClient.GetLocalVolumeDiscovery(localVolumeDiscoveryComponent, os.Getenv("WATCH_NAMESPACE"))
	if err != nil {
		klog.Error(err, "failed to get LocalVolumeDiscovery object")
		return &DeviceDiscovery{}, err
	}
	dd.localVolumeDiscovery = lvd
	return dd, nil
}

// Start the device discovery process
func (discovery *DeviceDiscovery) Start() error {
	klog.Info("starting device discovery")
	err := discovery.ensureDiscoveryResultCR()
	if err != nil {
		message := "failed to start device discovery"
		e := diskmaker.NewEvent(diskmaker.ErrorCreatingDiscoveryResultObject, fmt.Sprintf("%s. Error: %+v", message, err), "")
		discovery.eventSync.Report(e, discovery.localVolumeDiscovery)
		return errors.Wrapf(err, message)
	}

	err = discovery.discoverDevices()
	if err != nil {
		return errors.Wrapf(err, "failed to discover devices")
	}

	// Watch udev events for continuous discovery of devices
	sigc := make(chan os.Signal, 1)
	signal.Notify(sigc, syscall.SIGTERM)

	udevEvents := make(chan string)
	go udevBlockMonitor(udevEvents, udevEventPeriod)
	for {
		select {
		case <-sigc:
			klog.Info("shutdown signal received, exiting...")
			return nil
		case <-time.After(probeInterval):
			if err := discovery.discoverDevices(); err != nil {
				klog.Errorf("failed to discover devices during probe interval. %v", err)
			}
		case _, ok := <-udevEvents:
			if ok {
				klog.Info("trigger probe from udev event")
				if err := discovery.discoverDevices(); err != nil {
					klog.Errorf("failed to discover devices triggered from udev event. %v", err)
				}
			} else {
				klog.Warningf("disabling udev monitoring")
				udevEvents = nil
			}
		}
	}
}

// discoverDevices identifies the list of usable disks on the current node
func (discovery *DeviceDiscovery) discoverDevices() error {
	// List all the valid block devices on the node
	validDevices, err := getValidBlockDevices()
	if err != nil {
		message := "failed to discover devices"
		e := diskmaker.NewEvent(diskmaker.ErrorListingBlockDevices, fmt.Sprintf("%s. Error: %+v", message, err), "")
		discovery.eventSync.Report(e, discovery.localVolumeDiscovery)
		return errors.Wrapf(err, message)
	}

	klog.Infof("valid block devices: %+v", validDevices)

	discoveredDisks := getDiscoverdDevices(validDevices)
	klog.Infof("discovered devices: %+v", discoveredDisks)

	// Update discovered devices in the  LocalVolumeDiscoveryResult resource
	if !reflect.DeepEqual(discovery.disks, discoveredDisks) {
		klog.Info("device list updated. Updating LocalVolumeDiscoveryResult status...")
		discovery.disks = discoveredDisks
		err = discovery.updateStatus()
		if err != nil {
			message := "failed to update LocalVolumeDiscoveryResult status"
			e := diskmaker.NewEvent(diskmaker.ErrorUpdatingDiscoveryResultObject, fmt.Sprintf("%s. Error: %+v", message, err), "")
			discovery.eventSync.Report(e, discovery.localVolumeDiscovery)
			return errors.Wrapf(err, message)
		}
		message := "successfully updated discovered device details in the LocalVolumeDiscoveryResult resource"
		e := diskmaker.NewSuccessEvent(diskmaker.UpdatedDiscoveredDeviceList, message, "")
		discovery.eventSync.Report(e, discovery.localVolumeDiscovery)
	}

	return nil
}

// getValidBlockDevices fetchs all the block devices sutitable for discovery
func getValidBlockDevices() ([]diskutil.BlockDevice, error) {
	blockDevices, output, err := diskutil.ListBlockDevices([]string{})
	if err != nil {
		return blockDevices, errors.Wrapf(err, "failed to list all the block devices in the node, stderr=%v", output)
	}

	// Get valid list of devices
	validDevices := make([]diskutil.BlockDevice, 0)
	for _, blockDevice := range blockDevices {
		if ignoreDevices(blockDevice) {
			continue
		}
		validDevices = append(validDevices, blockDevice)
	}

	return validDevices, nil
}

// getDiscoverdDevices creates v1alpha1.DiscoveredDevice from diskutil.BlockDevices
func getDiscoverdDevices(blockDevices []diskutil.BlockDevice) []v1alpha1.DiscoveredDevice {
	discoveredDevices := make([]v1alpha1.DiscoveredDevice, 0)
	for _, blockDevice := range blockDevices {
		deviceID, err := blockDevice.GetPathByID("" /*existing symlink path*/)
		if err != nil {
			klog.Warningf("failed to get persistent ID for the device %q. Error %v", blockDevice.Name, err)
			deviceID = ""
		}

		path, err := blockDevice.GetDevPath()
		if err != nil {
			klog.Warningf("failed to parse path for the device %q. Error %v", blockDevice.KName, err)
		}
		discoveredDevice := v1alpha1.DiscoveredDevice{
			Path:     path,
			Model:    blockDevice.Model,
			Vendor:   blockDevice.Vendor,
			FSType:   blockDevice.FSType,
			Serial:   blockDevice.Serial,
			Type:     parseDeviceType(blockDevice.Type),
			DeviceID: deviceID,
			Size:     blockDevice.Size,
			Property: parseDeviceProperty(blockDevice.Rotational),
			Status:   getDeviceStatus(blockDevice),
			WWN:      blockDevice.WWN,
		}
		discoveredDevices = append(discoveredDevices, discoveredDevice)
	}

	return uniqueDevices(discoveredDevices)
}

// uniqueDevices removes duplicate devices from the list using DeviceID as a key
// TODO: remove this and use lsblk with -M flag once base images are updated and lsblk v2.34 or higher is available
// See: https://github.com/util-linux/util-linux/blob/3be31a106c52e093928afbea2cddbdbe44cfb357/Documentation/releases/v2.34-ReleaseNotes#L18
func uniqueDevices(sample []v1alpha1.DiscoveredDevice) []v1alpha1.DiscoveredDevice {
	var unique []v1alpha1.DiscoveredDevice
	type key struct{ value, value2 string }
	m := make(map[key]int)
	for _, v := range sample {
		k := key{v.DeviceID, v.Path}
		if i, ok := m[k]; ok {
			unique[i] = v
		} else {
			m[k] = len(unique)
			unique = append(unique, v)
		}
	}
	return unique
}

// ignoreDevices checks if a device should be ignored during discovery
func ignoreDevices(dev diskutil.BlockDevice) bool {
	if dev.ReadOnly {
		klog.Infof("ignoring read only device %q", dev.Name)
		return true
	}

	if dev.State == diskutil.StateSuspended {
		klog.Infof("ignoring device %q with invalid state %q", dev.Name, dev.State)
		return true
	}

	if !supportedDeviceTypes.Has(dev.Type) {
		klog.Infof("ignoring device %q with unsupported type %q", dev.Name, dev.Type)
		return true
	}

	if dev.Removable {
		klog.Infof("ignoring device %s with removable capability", dev.Name)
		return true
	}

	if strings.Trim(dev.WWN, " ") == "" {
		klog.Infof("ignoring device %q with undefined WWN", dev.Name)
		return true
	}

	return false
}

// getDeviceStatus returns device status as "Available", "NotAvailable" or "Unknown"
func getDeviceStatus(dev diskutil.BlockDevice) v1alpha1.DeviceStatus {
	status := v1alpha1.DeviceStatus{}
	if dev.FSType != "" {
		klog.Infof("device %q with filesystem %q is not available", dev.Name, dev.FSType)
		status.State = v1alpha1.NotAvailable
		return status
	}

	noBiosBootInPartLabel, err := filterMap["noBiosBootInPartLabel"](dev)
	if err != nil {
		status.State = v1alpha1.Unknown
		return status
	}
	if !noBiosBootInPartLabel {
		klog.Infof("device %q with part label %q is not available", dev.Name, dev.PartLabel)
		status.State = v1alpha1.NotAvailable
		return status
	}

	canOpen, err := filterMap["canOpenExclusively"](dev)
	if err != nil {
		status.State = v1alpha1.Unknown
		return status
	}
	if !canOpen {
		klog.Infof("device %q is not available as it can't be opened exclusively", dev.Name)
		status.State = v1alpha1.NotAvailable
		return status
	}

	mountPoint, err := dev.HasBindMounts()
	if err != nil {
		status.State = v1alpha1.Unknown
		return status
	}

	if mountPoint != "" {
		klog.Infof("device %q with mount point %q is not available", dev.Name, mountPoint)
		status.State = v1alpha1.NotAvailable
		return status
	}

	klog.Infof("device %q is available", dev.Name)
	status.State = v1alpha1.Available
	return status
}

func parseDeviceProperty(property bool) v1alpha1.DeviceMechanicalProperty {
	switch property {
	case true:
		return v1alpha1.Rotational
	case false:
		return v1alpha1.NonRotational
	default:
		return ""
	}
}

func parseDeviceType(deviceType string) v1alpha1.DiscoveredDeviceType {
	switch deviceType {
	case "disk":
		return v1alpha1.DiskType
	case "part":
		return v1alpha1.PartType
	case "lvm":
		return v1alpha1.LVMType
	case "mpath":
		return v1alpha1.MultiPathType
	default:
		return ""
	}
}
