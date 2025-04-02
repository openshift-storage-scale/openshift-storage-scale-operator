package machineconfig

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"reflect"

	machineconfigv1 "github.com/openshift/api/machineconfiguration/v1"
	ctrlcommon "github.com/openshift/machine-config-operator/pkg/controller/common"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"sigs.k8s.io/controller-runtime/pkg/client"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
)

// apiVersion: machineconfiguration.openshift.io/v1
// kind: MachineConfig
// metadata:
//   labels:
//     machineconfiguration.openshift.io/role: worker
//   name: 00-worker-ibm-spectrum-scale-kernel-devel
// spec:
//   config:
//     ignition:
//       version: 3.2.0
//   extensions:
//   - kernel-devel

func NewMachineConfig(labels map[string]string) *machineconfigv1.MachineConfig {
	return &machineconfigv1.MachineConfig{
		ObjectMeta: metav1.ObjectMeta{
			Name:   "00-worker-ibm-spectrum-scale-kernel-devel",
			Labels: labels,
		},
		Spec: *NewMachineConfigSpec(),
	}
}

func NewMachineConfigSpec() *machineconfigv1.MachineConfigSpec {
	tmpIgnCfg := ctrlcommon.NewIgnConfig()
	rawTmpIgnCfg, _ := json.Marshal(tmpIgnCfg)

	return &machineconfigv1.MachineConfigSpec{
		// config is a Ignition Config object.
		// +optional
		Config: runtime.RawExtension{
			Raw: rawTmpIgnCfg,
		},
		// extensions contains a list of additional features that can be enabled on host
		// +listType=atomic
		// +optional
		Extensions: []string{"kernel-devel"},
	}
}

func CreateOrUpdateMachineConfig(ctx context.Context, mc *machineconfigv1.MachineConfig, cl client.Client) error {
	old_mc := &machineconfigv1.MachineConfig{}
	if err := cl.Get(ctx, client.ObjectKeyFromObject(mc), old_mc); err != nil {
		if !apierrors.IsNotFound(err) {
			return fmt.Errorf("could not check for existing MachineConfig: %w", err)
		}
		if err := cl.Create(ctx, mc); err != nil {
			return fmt.Errorf("could not create MachineConfig: %w", err)
		}
		return nil
	}
	if !reflect.DeepEqual(old_mc.Spec, mc.Spec) {
		old_mc.OwnerReferences = mc.OwnerReferences
		old_mc.Spec = mc.Spec
		if err := cl.Update(ctx, old_mc); err != nil {
			return fmt.Errorf("could not update MachineConfig: %w", err)
		}
	}
	return nil
}

// WaitForMachineConfigPoolUpdated polls the MachineConfigPool until it shows Updated=True
func WaitForMachineConfigPoolUpdated(ctx context.Context, client dynamic.Interface, mcpName string) error {
	mcpGVR := schema.GroupVersionResource{
		Group:    "machineconfiguration.openshift.io",
		Version:  "v1",
		Resource: "machineconfigpools",
	}

	// 1. Get the latest MachineConfigPool object
	mcp, err := client.Resource(mcpGVR).Get(ctx, mcpName, metav1.GetOptions{})
	if err != nil {
		return fmt.Errorf("failed to get MachineConfigPool %q: %w", mcpName, err)
	}

	// 2. Check if the MCP is "Updated"
	updated, reason, err := isMachineConfigPoolUpdating(mcp)
	if err != nil {
		return fmt.Errorf("failed to parse MCP conditions: %w", err)
	}

	machineCountsMatch, countMsg, err := doMachineCountsMatch(mcp)
	if err != nil {
		return fmt.Errorf("failed to parse machine counts: %w", err)
	}

	// 3. Are both conditions satisfied?
	if updated && machineCountsMatch {
		fmt.Printf("MachineConfigPool %q is complete:\n  - Updated=True\n  - %s\n", mcpName, countMsg)
		return nil
	}

	// Log partial progress
	fmt.Printf("MachineConfigPool %q not ready yet:\n  - Updated=%v (reason: %s)\n  - %s\n",
		mcpName, updated, reason, countMsg)

	if updated {
		fmt.Printf("MachineConfigPool %q has completed (Updated=True)\n", mcpName)
		return nil
	}

	return fmt.Errorf("MachineConfigPool %q not updated yet. Reason: %s", mcpName, reason)
}

// FIXME(bandini): For now we check for the conditions and if one is of type Updated and status True we return true.
// And we also check that machineCount == readyMachineCount == updatedMachineCount. We will need to make sure that this is
// the correct way to check for the MCP to be updated. Also there might be a small race window still where the MCP is showing
// update because it has not yet started. If we create the spectrum cluster before that we might hit the race again
// conditions:
//   - lastTransitionTime: "2025-03-01T11:31:08Z"
//     message: ""
//     reason: ""
//     status: "False"
//     type: RenderDegraded
//   - lastTransitionTime: "2025-03-01T11:31:13Z"
//     message: ""
//     reason: ""
//     status: "False"
//     type: NodeDegraded
//   - lastTransitionTime: "2025-03-01T11:31:13Z"
//     message: ""
//     reason: ""
//     status: "False"
//     type: Degraded
//   - lastTransitionTime: "2025-03-01T12:02:56Z"
//     message: All nodes are updated with MachineConfig rendered-worker-7056a3d79e377146ee42af553e10ee68
//     reason: ""
//     status: "True"
//     type: Updated
//   - lastTransitionTime: "2025-03-01T12:02:56Z"
//     message: ""
//     reason: ""
//     status: "False"
//     type: Updating
//
// isMachineConfigPoolUpdated checks the MCP's status conditions to see if it has Updated=True
func isMachineConfigPoolUpdating(mcp *unstructured.Unstructured) (updating bool, reason string, err error) {
	conditions, found, err := unstructured.NestedSlice(mcp.Object, "status", "conditions")
	if err != nil {
		return false, "", err
	}
	if !found {
		return false, "no conditions found", nil
	}

	// Parse each condition and see if type=Updated with status=True
	for _, c := range conditions {
		cond, ok := c.(map[string]any)
		if !ok {
			return false, "", errors.New("condition is not in expected map format")
		}

		condType, _, _ := unstructured.NestedString(cond, "type")
		condStatus, _, _ := unstructured.NestedString(cond, "status")
		condReason, _, _ := unstructured.NestedString(cond, "reason")

		if condType == "Updated" && condStatus == "True" {
			return true, condReason, nil
		}
	}

	// Not updated yet
	return false, "Updated=False", nil
}

// doMachineCountsMatch checks that machineCount == readyMachineCount == updatedMachineCount
func doMachineCountsMatch(mcp *unstructured.Unstructured) (countsMatch bool, reason string, err error) {
	var (
		machineCount        int64
		readyMachineCount   int64
		updatedMachineCount int64
	)

	// Extract each count field from status
	mCount, found, err := unstructured.NestedInt64(mcp.Object, "status", "machineCount")
	if err != nil {
		return false, "", err
	}
	if found {
		machineCount = mCount
	} else {
		// Not found—some clusters may have slightly different field names
		return false, "status.machineCount not found", nil
	}

	rCount, found, err := unstructured.NestedInt64(mcp.Object, "status", "readyMachineCount")
	if err != nil {
		return false, "", err
	}
	if found {
		readyMachineCount = rCount
	} else {
		return false, "status.readyMachineCount not found", nil
	}

	uCount, found, err := unstructured.NestedInt64(mcp.Object, "status", "updatedMachineCount")
	if err != nil {
		return false, "", err
	}
	if found {
		updatedMachineCount = uCount
	} else {
		return false, "status.updatedMachineCount not found", nil
	}

	// Compare
	if machineCount == readyMachineCount && readyMachineCount == updatedMachineCount {
		msg := fmt.Sprintf(
			"machineCount == readyMachineCount == updatedMachineCount == %d",
			machineCount,
		)
		return true, msg, nil
	}

	// Construct a message with the mismatch
	msg := fmt.Sprintf(
		"counts mismatch: machineCount=%d, readyMachineCount=%d, updatedMachineCount=%d",
		machineCount, readyMachineCount, updatedMachineCount,
	)
	return false, msg, nil
}
