package discovery

import (
	"fmt"
	"strings"

	internal "github.com/openshift-storage-scale/openshift-storage-scale-operator/internal/diskutils"

	"golang.org/x/sys/unix"
)

const (
	// filter names:
	notReadOnly           = "notReadOnly"
	notRemovable          = "notRemovable"
	notSuspended          = "notSuspended"
	noBiosBootInPartLabel = "noBiosBootInPartLabel"
	noFilesystemSignature = "noFilesystemSignature"
	noBindMounts          = "noBindMounts"
	// file access , can't mock test
	noChildren = "noChildren"
	// file access , can't mock test
	canOpenExclusively = "canOpenExclusively"
)

// maps of function identifier (for logs) to filter function.
// These are passed the localv1alpha1.DeviceInclusionSpec to make testing easier,
// but they aren't expected to use it
// they verify that the device itself is good to use
var filterMap = map[string]func(internal.BlockDevice) (bool, error){
	notReadOnly: func(dev internal.BlockDevice) (bool, error) {
		return !dev.ReadOnly, nil
	},

	notRemovable: func(dev internal.BlockDevice) (bool, error) {
		return !dev.Removable, nil
	},

	notSuspended: func(dev internal.BlockDevice) (bool, error) {
		return dev.State != internal.StateSuspended, nil
	},

	noBiosBootInPartLabel: func(dev internal.BlockDevice) (bool, error) {
		biosBootInPartLabel := strings.Contains(strings.ToLower(dev.PartLabel), strings.ToLower("bios")) ||
			strings.Contains(strings.ToLower(dev.PartLabel), strings.ToLower("boot"))
		return !biosBootInPartLabel, nil
	},

	noFilesystemSignature: func(dev internal.BlockDevice) (bool, error) {
		return dev.FSType == "", nil
	},
	noBindMounts: func(dev internal.BlockDevice) (bool, error) {
		hasBindMounts, _, err := dev.HasBindMounts()
		return !hasBindMounts, err
	},

	noChildren: func(dev internal.BlockDevice) (bool, error) {
		return len(dev.Children) == 0, nil
	},
	canOpenExclusively: func(dev internal.BlockDevice) (bool, error) {
		pathname, err := dev.GetDevPath()
		if err != nil {
			return false, fmt.Errorf("pathname: %q: %w", pathname, err)
		}
		fd, errno := unix.Open(pathname, unix.O_RDONLY|unix.O_EXCL, 0)
		// If the device is in use, open will return an invalid fd.
		// When this happens, it is expected that Close will fail and throw an error.
		defer unix.Close(fd)
		if errno == nil {
			// device not in use
			return true, nil
		} else if errno == unix.EBUSY {
			// device is in use
			return false, nil
		}
		// error during call to Open
		return false, fmt.Errorf("pathname: %q: %w", pathname, errno)

	},
}
