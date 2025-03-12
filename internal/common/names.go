package common

import (
	"os"
)

const (
	defaultDiskMakerImageVersion = "quay.io/openshift-storage-scale/openshift-storage-scale-operator-diskmaker"
	defaultKubeProxyImage        = "quay.io/openshift/origin-kube-rbac-proxy:latest"

	// OwnerNamespaceLabel references the owning object's namespace
	OwnerNamespaceLabel = "scale.storage.openshift.io/owner-namespace"
	// OwnerNameLabel references the owning object
	OwnerNameLabel = "scale.storage.openshift.io/owner-name"

	// DiskMakerImageEnv is used by the operator to read the DISKMAKER_IMAGE from the environment
	DiskMakerImageEnv = "DISKMAKER_IMAGE"
	// KubeRBACProxyImageEnv is used by the operator to read the KUBE_RBAC_PROXY_IMAGE from the environment
	KubeRBACProxyImageEnv = "KUBE_RBAC_PROXY_IMAGE"

	// DiscoveryNodeLabelKey is the label key on the discovery result CR used to identify the node it belongs to.
	// the value is the node's name
	DiscoveryNodeLabel = "discovery-result-node"

	DiskMakerDiscoveryDaemonSetTemplate = "templates/diskmaker-discovery-daemonset.yaml"
)

// GetDiskMakerImage returns the image to be used for diskmaker daemonset
func GetDiskMakerImage() string {
	if diskMakerImageFromEnv := os.Getenv(DiskMakerImageEnv); diskMakerImageFromEnv != "" {
		return diskMakerImageFromEnv
	}
	return defaultDiskMakerImageVersion
}

// GetKubeRBACProxyImage returns the image to be used for Kube RBAC Proxy sidecar container
func GetKubeRBACProxyImage() string {
	if kubeRBACProxyImageFromEnv := os.Getenv(KubeRBACProxyImageEnv); kubeRBACProxyImageFromEnv != "" {
		return kubeRBACProxyImageFromEnv
	}
	return defaultKubeProxyImage
}
