package controller

import (
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
)

// FIXME(bandini): We need to do the below due to a bug on 5.2.2.x - See OCPNAS-31
// Once we only support 5.2.3.x we can go back at having only "/dev/disk/by-id/*"
func NewSpectrumCluster(daemon_nodeSelector map[string]string) *unstructured.Unstructured {
	return &unstructured.Unstructured{
		Object: map[string]any{
			"apiVersion": "scale.spectrum.ibm.com/v1beta1",
			"kind":       "Cluster",
			"metadata": map[string]any{
				"name":      "ibm-spectrum-scale",
				"namespace": "ibm-spectrum-scale",
			},
			"spec": map[string]any{
				"daemon": map[string]any{
					"nodeSelector": daemon_nodeSelector,
					"nsdDevicesConfig": map[string]any{
						"localDevicePaths": []any{
							map[string]any{
								"devicePath": "/dev/disk/by-id/*",
								"deviceType": "generic",
							},
							map[string]any{
								"devicePath": "/dev/sd*",
								"deviceType": "generic",
							},
							map[string]any{
								"devicePath": "/dev/hd*",
								"deviceType": "generic",
							},
							map[string]any{
								"devicePath": "/dev/scini*",
								"deviceType": "generic",
							},
							map[string]any{
								"devicePath": "/dev/pmem*",
								"deviceType": "generic",
							},
							map[string]any{
								"devicePath": "/dev/nvm*",
								"deviceType": "generic",
							},
							map[string]any{
								"devicePath": "/dev/dm-*",
								"deviceType": "generic",
							},
							map[string]any{
								"devicePath": "/dev/vpath*",
								"deviceType": "generic",
							},
							map[string]any{
								"devicePath": "/dev/dasd*",
								"deviceType": "generic",
							},
							map[string]any{
								"devicePath": "/dev/emcpower*",
								"deviceType": "generic",
							},
						},
					},
				},
				"license": map[string]any{
					"accept":  true,
					"license": "data-management",
				},
			},
		},
	}
}
