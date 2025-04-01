/*
Copyright 2022.

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

package utils

import (
	"fmt"
	"os"
	"strings"

	"github.com/Masterminds/semver/v3"
	configv1 "github.com/openshift/api/config/v1"
)

// Taken from https://www.ibm.com/docs/en/scalecontainernative/5.2.2?topic=planning-software-requirements
type StorageScaleData struct {
	CSIVersion                string   `json:"csi_version"`
	Architecture              []string `json:"architecture"`
	RemoteStorageClusterLevel string   `json:"remote_storage_cluster_level"`
	FileSystemVersion         string   `json:"file_system_version"`
	OpenShiftLevels           []string `json:"openshift_levels"`
}

// The dict key is the IBM Storage Scale Container Native version
var storageScaleTable = map[string]StorageScaleData{
	"5.1.5.0": {"2.7.0", []string{"x86_64", "ppc64le", "s390x"}, "5.1.3.0+", "29.00", []string{"4.9", "4.10", "4.11"}},
	"5.1.6.0": {"2.8.0", []string{"x86_64", "ppc64le", "s390x"}, "5.1.3.0+", "30.00", []string{"4.9", "4.10", "4.11"}},
	"5.1.7.0": {"2.9.0", []string{"x86_64", "ppc64le", "s390x"}, "5.1.3.0+", "31.00", []string{"4.10", "4.11", "4.12"}},
	"5.1.9.1": {"2.10.0", []string{"x86_64", "ppc64le", "s390x"}, "5.1.3.0+", "33.00", []string{"4.12", "4.13", "4.14"}},
	"5.1.9.3": {"2.10.1", []string{"x86_64", "ppc64le", "s390x"}, "5.1.3.0+", "33.00", []string{"4.12", "4.13", "4.14"}},
	"5.1.9.4": {"2.10.2", []string{"x86_64", "ppc64le", "s390x"}, "5.1.3.0+", "33.00", []string{"4.12", "4.13", "4.14"}},
	"5.1.9.5": {"2.10.3", []string{"x86_64", "ppc64le", "s390x"}, "5.1.3.0+", "33.00", []string{"4.12", "4.13", "4.14"}},
	"5.1.9.6": {"2.10.4", []string{"x86_64", "ppc64le", "s390x"}, "5.1.3.0+", "33.00", []string{"4.12", "4.13", "4.14"}},
	"5.1.9.7": {"2.10.5", []string{"x86_64", "ppc64le", "s390x"}, "5.1.3.0+", "33.00", []string{"4.12", "4.13", "4.14"}},
	"5.2.0.0": {"2.11.0", []string{"x86_64", "ppc64le", "s390x"}, "5.1.3.0+", "34.00", []string{"4.13", "4.14", "4.15"}},
	"5.2.0.1": {"2.11.1", []string{"x86_64", "ppc64le", "s390x"}, "5.1.3.0+", "34.00", []string{"4.13", "4.14", "4.15"}},
	"5.2.1.0": {"2.12.0", []string{"x86_64", "ppc64le", "s390x"}, "5.1.9.0+", "35.00", []string{"4.14", "4.15", "4.16"}},
	"5.2.1.1": {"2.12.1", []string{"x86_64", "ppc64le", "s390x"}, "5.1.9.0+", "35.00", []string{"4.14", "4.15", "4.16"}},
	"5.2.2.0": {"2.13.0", []string{"x86_64", "ppc64le", "s390x"}, "5.1.9.0+", "36.00", []string{"4.15", "4.16", "4.17"}},
	"5.2.2.1": {"2.13.1", []string{"x86_64", "ppc64le", "s390x"}, "5.1.9.0+", "36.00", []string{"4.15", "4.16", "4.17", "4.18"}},
}

func IsOpenShiftSupported(ibmStorageScaleVersion string, openShiftVersion semver.Version) bool {
	// Strip the leading "v" from the IBM Storage Scale version
	ibmVer := ibmStorageScaleVersion
	if strings.HasPrefix(ibmStorageScaleVersion, "v") {
		ibmVer = ibmStorageScaleVersion[1:] // Remove the first character
	}

	data, exists := storageScaleTable[ibmVer]
	if !exists {
		return false
	}

	for _, version := range data.OpenShiftLevels {
		constraint, err := semver.NewConstraint(fmt.Sprintf("~%s", version))
		if err != nil {
			return false
		}
		if constraint.Check(&openShiftVersion) {
			return true
		}
	}

	return false
}

// status:
//  history:
//   - completionTime: null
//     image: quay.io/openshift-release-dev/ocp-release@sha256:af19e94813478382e36ae1fa2ae7bbbff1f903dded6180f4eb0624afe6fc6cd4
//     startedTime: "2023-07-18T07:48:54Z"
//     state: Partial
//     verified: true
//     version: 4.13.5
//   - completionTime: "2023-07-18T07:08:50Z"
//     image: quay.io/openshift-release-dev/ocp-release@sha256:e3fb8ace9881ae5428ae7f0ac93a51e3daa71fa215b5299cd3209e134cadfc9c
//     startedTime: "2023-07-18T06:48:44Z"
//     state: Completed
//     verified: false
//     version: 4.13.4
//   observedGeneration: 4
//     version: 4.10.32

// This function returns the current version of the cluster. Ideally
// We return the first version with Completed status
// https://pkg.go.dev/github.com/openshift/api/config/v1#ClusterVersionStatus specifies that the ordering is preserved
// We do have a fallback in case the history does either not exist or it simply has never completed an update:
// in such cases we just fallback to the status.desired.version
func GetCurrentClusterVersion(clusterversion *configv1.ClusterVersion) (*semver.Version, error) {
	// First, check the history for completed versions
	for _, v := range clusterversion.Status.History {
		if v.State == "Completed" {
			return parseAndReturnVersion(v.Version)
		}
	}

	// If no completed versions are found, use the desired version
	return parseAndReturnVersion(clusterversion.Status.Desired.Version)
}

func parseAndReturnVersion(versionStr string) (*semver.Version, error) {
	s, err := semver.NewVersion(versionStr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse version %s: %w", versionStr, err)
	}
	return s, nil
}

// GetDeploymentNamespace returns the Namespace this operator is deployed on.
func GetDeploymentNamespace() (string, error) {
	var deployNamespaceEnvVar = "DEPLOYMENT_NAMESPACE"

	ns, found := os.LookupEnv(deployNamespaceEnvVar)
	if !found {
		return "", fmt.Errorf("%s must be set", deployNamespaceEnvVar)
	}
	return ns, nil
}
