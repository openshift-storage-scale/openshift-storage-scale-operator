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

package controller

import (
	"context"
	"os"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	configv1 "github.com/openshift/api/config/v1"
	operatorv1 "github.com/openshift/api/operator/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"k8s.io/apimachinery/pkg/types"

	kubeclient "k8s.io/client-go/kubernetes/fake"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"

	"sigs.k8s.io/controller-runtime/pkg/reconcile"

	fusionv1alpha "github.com/openshift-storage-scale/openshift-fusion-access-operator/api/v1alpha1"
)

const (
	resourceName   = "test-resource"
	oscinitVersion = "v4.17.0"
)

var _ = Describe("FusionAccess Controller", func() {
	var (
		fakeClientBuilder *fake.ClientBuilder
		scheme            = createFakeScheme()
		namespace         = newNamespace("openshift-fusion-access-operator")
		version           = newOCPVersion(oscinitVersion)
		clusterConsole    = &operatorv1.Console{ObjectMeta: metav1.ObjectMeta{Name: "cluster"}}
	)
	Context("When reconciling a resource", func() {
		const resourceName = "test-resource"

		ctx := context.Background()

		typeNamespacedName := types.NamespacedName{
			Name:      resourceName,
			Namespace: "default", // TODO(user):Modify as needed
		}

		BeforeEach(func() {
			By("creating the custom resource for the Kind FusionAccess")
			os.Setenv("DEPLOYMENT_NAMESPACE", "openshift-fusion-access-operator")
			fakeClientBuilder = fake.NewClientBuilder().
				WithScheme(scheme).
				WithRuntimeObjects(version, namespace, clusterConsole).
				WithStatusSubresource(&fusionv1alpha.FusionAccess{})

		})

		AfterEach(func() {
			os.Unsetenv("DEPLOYMENT_NAMESPACE")
		})

		It("should successfully reconcile the resource", func() {
			resource := &fusionv1alpha.FusionAccess{
				ObjectMeta: metav1.ObjectMeta{
					Name:      resourceName,
					Namespace: "default",
				},
				Spec: fusionv1alpha.FusionAccessSpec{
					IbmCnsaVersion:       "v5.2.2.1",
					LocalVolumeDiscovery: fusionv1alpha.StorageDeviceDiscovery{
						// Create: false,
					},
				},
			}
			k8sClient = fakeClientBuilder.WithRuntimeObjects(resource).Build()
			Expect(k8sClient).NotTo(BeNil())

			By("Reconciling the custom resource created")
			FusionAccessReconciler := &FusionAccessReconciler{
				Client:     k8sClient,
				Scheme:     k8sClient.Scheme(),
				fullClient: kubeclient.NewSimpleClientset(),
				// dynamicClient: k8sClient,
			}

			_, err := FusionAccessReconciler.Reconcile(ctx, reconcile.Request{
				NamespacedName: typeNamespacedName,
			})
			Expect(err).To(Not(HaveOccurred()))

		})
	})
})

func newNamespace(name string) *corev1.Namespace {
	return &corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: name}}
}

func newOCPVersion(version string) *configv1.ClusterVersion {
	return &configv1.ClusterVersion{
		ObjectMeta: metav1.ObjectMeta{Name: "version"},
		Status: configv1.ClusterVersionStatus{
			History: []configv1.UpdateHistory{
				{State: configv1.CompletedUpdate,
					Version: version},
			},
		},
	}
}
