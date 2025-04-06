package controller

import (
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
)

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
