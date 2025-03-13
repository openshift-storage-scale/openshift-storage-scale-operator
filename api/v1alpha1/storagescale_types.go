/*
Copyright 2025.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package v1alpha1

import (
	operatorv1 "github.com/openshift/api/operator/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// StorageScaleSpec defines the desired state of StorageScale
type StorageScaleSpec struct {
	// MachineConfig labeling for the installation of kernel-devel package
	// +operator-sdk:csv:customresourcedefinitions:type=spec,order=1
	MachineConfig MachineConfig `json:"mco_config,omitempty"`

	// Version of IBMs installation manifests found at https://github.com/IBM/ibm-spectrum-scale-container-native
	// +operator-sdk:csv:customresourcedefinitions:type=spec,order=2
	IbmCnsaVersion string `json:"ibm_cnsa_version,omitempty"`

	// +operator-sdk:csv:customresourcedefinitions:type=spec,order=3
	Cluster IBMSpectrumCluster `json:"ibm_cnsa_cluster,omitempty"`

	// +operator-sdk:csv:customresourcedefinitions:type=spec,order=4
	LocalVolumeDiscovery StorageDeviceDiscovery `json:"storagedevicediscovery,omitempty"`
}
type StorageDeviceDiscovery struct {
	// +kubebuilder:default:=true
	Create bool `json:"create,omitempty"`
}

type MachineConfig struct {
	// Boolean to create the MachinConfig objects
	// +operator-sdk:csv:customresourcedefinitions:type=spec,order=4,xDescriptors={"urn:alm:descriptor:com.tectonic.ui:booleanSwitch"}
	// +kubebuilder:default:=true
	Create bool `json:"create,omitempty"`
	// Labels to be used for the machineconfigpool
	// +operator-sdk:csv:customresourcedefinitions:type=spec,order=5,xDescriptors={"urn:alm:descriptor:com.tectonic.ui:fieldDependency:mco_config.create:true"}
	Labels map[string]string `json:"labels,omitempty"`
}

type IBMSpectrumCluster struct {
	// Boolean to create the CNSA cluster object
	// +operator-sdk:csv:customresourcedefinitions:type=spec,order=6,xDescriptors={"urn:alm:descriptor:com.tectonic.ui:booleanSwitch"}
	// +kubebuilder:default:=true
	Create bool `json:"create,omitempty"`
	// Nodes with this label will be part of the cluster, must have at least 3 nodes with this
	// +operator-sdk:csv:customresourcedefinitions:type=spec,order=7,xDescriptors={"urn:alm:descriptor:com.tectonic.ui:fieldDependency:ibm_cnsa_cluster.create:true"}
	Daemon_nodeSelector map[string]string `json:"daemon_nodeSelector,omitempty"`
}

// StorageScaleStatus defines the observed state of StorageScale
type StorageScaleStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file
	// Conditions is a list of conditions and their status.
	Conditions []operatorv1.OperatorCondition `json:"conditions,omitempty"`
	// TotalProvisionedDeviceCount is the count of the total devices over which the PVs has been provisioned
	TotalProvisionedDeviceCount *int32 `json:"totalProvisionedDeviceCount,omitempty"`
	// observedGeneration is the last generation change the operator has dealt with
	// +optional
	ObservedGeneration int64 `json:"observedGeneration,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// StorageScale is the Schema for the storagescales API
type StorageScale struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   StorageScaleSpec   `json:"spec,omitempty"`
	Status StorageScaleStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// StorageScaleList contains a list of StorageScale
type StorageScaleList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []StorageScale `json:"items"`
}

func init() {
	SchemeBuilder.Register(&StorageScale{}, &StorageScaleList{})
}

// DeviceMechanicalProperty holds the device's mechanical spec. It can be rotational or nonRotational
type DeviceMechanicalProperty string

// The mechanical properties of the devices
const (
	// Rotational refers to magnetic disks
	Rotational DeviceMechanicalProperty = "Rotational"
	// NonRotational refers to ssds
	NonRotational DeviceMechanicalProperty = "NonRotational"
)

// DeviceType is the types that will be supported by the LSO.
type DeviceType string

const (
	// RawDisk represents a device-type of block disk
	RawDisk DeviceType = "disk"
	// Partition represents a device-type of partition
	Partition DeviceType = "part"
	// Loop type device
	Loop DeviceType = "loop"
	// Multipath device type
	MultiPath DeviceType = "mpath"
)
