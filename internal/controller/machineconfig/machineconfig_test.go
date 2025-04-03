package machineconfig

import (
	"context"
	"reflect"
	"testing"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	machineconfigv1 "github.com/openshift/api/machineconfiguration/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"

	"sigs.k8s.io/controller-runtime/pkg/client/fake"
)

func TestMachineConfig(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "MachineConfig")
}

var _ = Describe("MachineConfig", func() {
	var (
		ctx     context.Context
		labels  map[string]string
		scheme  *runtime.Scheme
		fclient client.WithWatch
	)

	BeforeEach(func() {
		ctx = context.TODO()
		labels = map[string]string{
			"machineconfiguration.openshift.io/role": "worker",
		}
		scheme = runtime.NewScheme()
		Expect(machineconfigv1.AddToScheme(scheme)).To(Succeed())
		fclient = fake.NewClientBuilder().WithScheme(scheme).Build()
	})

	Describe("NewMachineConfig", func() {
		It("should create a MachineConfig with expected fields", func() {
			mc := NewMachineConfig(labels)
			Expect(mc.Name).To(Equal("00-worker-ibm-spectrum-scale-kernel-devel"))
			Expect(mc.Labels).To(Equal(labels))
			Expect(mc.Spec.Extensions).To(ContainElement("kernel-devel"))
		})
	})

	Describe("CreateOrUpdateMachineConfig", func() {
		It("should create the MachineConfig when it doesn't exist", func() {
			mc := NewMachineConfig(labels)
			err := CreateOrUpdateMachineConfig(ctx, mc, fclient)
			Expect(err).ToNot(HaveOccurred())
		})

		It("should update the MachineConfig when it exists", func() {
			mc := NewMachineConfig(labels)
			err := CreateOrUpdateMachineConfig(ctx, mc, fclient)
			Expect(err).ToNot(HaveOccurred())

			// Update the MachineConfig
			mc.Spec.Extensions = append(mc.Spec.Extensions, "new-extension")
			err = CreateOrUpdateMachineConfig(ctx, mc, fclient)
			Expect(err).ToNot(HaveOccurred())

			// Verify the update
			updatedMC := &machineconfigv1.MachineConfig{}
			err = fclient.Get(ctx, client.ObjectKey{Name: mc.Name}, updatedMC)
			Expect(err).ToNot(HaveOccurred())
			Expect(reflect.DeepEqual(mc.Spec, updatedMC.Spec)).To(BeTrue())
		})
	})

	Describe("isMachineConfigPoolUpdating", func() {
		It("should return true if Updated condition is True", func() {
			mcp := &unstructured.Unstructured{
				Object: map[string]any{
					"status": map[string]any{
						"conditions": []any{
							map[string]any{
								"type":   "Updated",
								"status": "True",
								"reason": "AllUpdated",
							},
						},
					},
				},
			}

			updating, reason, err := isMachineConfigPoolUpdating(mcp)
			Expect(err).ToNot(HaveOccurred())
			Expect(updating).To(BeTrue())
			Expect(reason).To(Equal("AllUpdated"))
		})

		It("should return false if no Updated condition is True", func() {
			mcp := &unstructured.Unstructured{
				Object: map[string]any{
					"status": map[string]any{
						"conditions": []any{
							map[string]any{
								"type":   "Updated",
								"status": "False",
							},
						},
					},
				},
			}

			updating, reason, err := isMachineConfigPoolUpdating(mcp)
			Expect(err).ToNot(HaveOccurred())
			Expect(updating).To(BeFalse())
			Expect(reason).To(Equal("Updated=False"))
		})
	})

	Describe("doMachineCountsMatch", func() {
		It("should return true when all machine counts match", func() {
			mcp := &unstructured.Unstructured{
				Object: map[string]any{
					"status": map[string]any{
						"machineCount":        int64(3),
						"readyMachineCount":   int64(3),
						"updatedMachineCount": int64(3),
					},
				},
			}

			match, msg, err := doMachineCountsMatch(mcp)
			Expect(err).ToNot(HaveOccurred())
			Expect(match).To(BeTrue())
			Expect(msg).To(ContainSubstring("== 3"))
		})

		It("should return false when machine counts mismatch", func() {
			mcp := &unstructured.Unstructured{
				Object: map[string]any{
					"status": map[string]any{
						"machineCount":        int64(3),
						"readyMachineCount":   int64(2),
						"updatedMachineCount": int64(3),
					},
				},
			}

			match, msg, err := doMachineCountsMatch(mcp)
			Expect(err).ToNot(HaveOccurred())
			Expect(match).To(BeFalse())
			Expect(msg).To(ContainSubstring("counts mismatch"))
		})
	})
})
