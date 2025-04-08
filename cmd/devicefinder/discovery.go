package main

import (
	"runtime"

	"github.com/openshift-storage-scale/openshift-fusion-access-operator/internal/devicefinder/discovery"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"k8s.io/klog/v2"
)

func startDeviceDiscovery(_ *cobra.Command, _ []string) error {
	printVersion()

	discoveryObj, err := discovery.NewDeviceDiscovery()
	if err != nil {
		return errors.Wrap(err, "failed to discover devices")
	}

	err = discoveryObj.Start()
	if err != nil {
		return errors.Wrap(err, "failed to discover devices")
	}

	return nil
}

func printVersion() {
	klog.Infof("Go Version: %s", runtime.Version())
	klog.Infof("Go OS/Arch: %s/%s", runtime.GOOS, runtime.GOARCH)
}
