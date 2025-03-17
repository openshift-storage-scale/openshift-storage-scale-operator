package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "devicefinder",
	Short: "Used to start the devicefinder daemon for the storage-scale-operator",
}

var discoveryDaemonCmd = &cobra.Command{
	Use:   "discover",
	Short: "Used to start device discovery to generate the StorageScaleDiscoveryResult CR",
	RunE:  startDeviceDiscovery,
}

func main() {
	rootCmd.AddCommand(discoveryDaemonCmd)

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
