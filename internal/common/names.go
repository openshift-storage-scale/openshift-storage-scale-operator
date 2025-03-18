package common

import (
	"os"
)

const (
	defaultDeviceFinderImageVersion = "quay.io/openshift-storage-scale/openshift-storage-scale-devicefinder"
	defaultKubeProxyImage           = "quay.io/openshift/origin-kube-rbac-proxy:latest"

	// OwnerNamespaceLabel references the owning object's namespace
	OwnerNamespaceLabel = "scale.storage.openshift.io/owner-namespace"
	// OwnerNameLabel references the owning object
	OwnerNameLabel = "scale.storage.openshift.io/owner-name"

	// DeviceFinderImageEnv is used by the operator to read the DEVICEFINDER_IMAGE from the environment
	DeviceFinderImageEnv = "DEVICEFINDER_IMAGE"
	// KubeRBACProxyImageEnv is used by the operator to read the KUBE_RBAC_PROXY_IMAGE from the environment
	KubeRBACProxyImageEnv = "KUBE_RBAC_PROXY_IMAGE"

	// DiscoveryNodeLabelKey is the label key on the discovery result CR used to identify the node it belongs to.
	// the value is the node's name
	DiscoveryNodeLabel = "discovery-result-node"

	DeviceFinderDiscoveryDaemonSetTemplate = "templates/devicefinder-discovery-daemonset.yaml"
)

// GetDeviceFinderImage returns the image to be used for devicefinder daemonset
func GetDeviceFinderImage() string {
	if deviceFinderImageFromEnv := os.Getenv(DeviceFinderImageEnv); deviceFinderImageFromEnv != "" {
		return deviceFinderImageFromEnv
	}
	return defaultDeviceFinderImageVersion
}

// GetKubeRBACProxyImage returns the image to be used for Kube RBAC Proxy sidecar container
func GetKubeRBACProxyImage() string {
	if kubeRBACProxyImageFromEnv := os.Getenv(KubeRBACProxyImageEnv); kubeRBACProxyImageFromEnv != "" {
		return kubeRBACProxyImageFromEnv
	}
	return defaultKubeProxyImage
}
