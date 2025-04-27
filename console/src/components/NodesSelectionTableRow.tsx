import {
  type RowProps,
  TableData,
} from "@openshift-console/dynamic-plugin-sdk";
import { Checkbox } from "@patternfly/react-core";
import { useSelectNodeHandler } from "@/hooks/useSelectNodeHandler";
import { useSharedDisksCount } from "@/hooks/useSharedDisksCount";
import type {
  IoK8sApiCoreV1Node,
  IoK8sApimachineryPkgApiResourceQuantity,
} from "@/models/kubernetes/1.30/types";
import type { LocalVolumeDiscoveryResult } from "@/models/fusion-access/LocalVolumeDiscoveryResult";
import { STORAGE_ROLE_LABEL, VALUE_NOT_AVAILABLE } from "@/constants";
import { hasLabel, getUid, getName } from "@/utils/console/K8sResourceCommon";
import {
  type NodeRoles,
  getMemory,
  getRole,
  getCpu,
  getSelectedNodes,
} from "@/utils/kubernetes/1.30/IoK8sApiCoreV1Node";
import { useState, useMemo } from "react";

export type TableRowProps = RowProps<
  IoK8sApiCoreV1Node,
  {
    nodes: IoK8sApiCoreV1Node[];
    disksDiscoveryResults: LocalVolumeDiscoveryResult[];
  }
>;

export const NodesSelectionTableRow: React.FC<TableRowProps> = (props) => {
  const { activeColumnIDs, obj: node, rowData } = props;
  const { nodes, disksDiscoveryResults } = rowData;
  const selectedNodes = getSelectedNodes(nodes);

  const [
    { uid, name, role, cpu, memory, isSelected, isSelectionPending },
    nodeSelectionActions,
  ] = useNodeSelectionState(node);

  const sharedDisksCount = useSharedDisksCount(
    name,
    isSelected,
    selectedNodes,
    disksDiscoveryResults
  );

  const handleNodeSelection = useSelectNodeHandler({
    node,
    isSelectionPending,
    nodeSelectionActions,
  });

  return (
    <>
      <TableData
        activeColumnIDs={activeColumnIDs}
        id="checkbox"
        className="pf-v5-c-table__check"
      >
        <Checkbox
          id={`node-${uid}`}
          isChecked={isSelected}
          isDisabled={isSelectionPending}
          onChange={handleNodeSelection}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        {name}
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="pf-v5-u-text-align-center"
        id="role"
      >
        {role}
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="pf-v5-u-text-align-center"
        id="cpu"
      >
        {cpu}
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="pf-v5-u-text-align-center"
        id="memory"
      >
        {memory}
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="pf-v5-u-text-align-center"
        id="shared-disks"
      >
        {sharedDisksCount}
      </TableData>
    </>
  );
};
NodesSelectionTableRow.displayName = "NodesSelectionTableRow";

interface NodeSelectionState {
  uid: string;
  name: string;
  role: NodeRoles;
  cpu: IoK8sApimachineryPkgApiResourceQuantity;
  memory: IoK8sApimachineryPkgApiResourceQuantity;
  isSelected: boolean;
  isSelectionPending: boolean;
}

export interface NodeSelectionActions {
  setSelectionPending: (checked: boolean) => void;
  setSelectionSucceeded: (checked: boolean) => void;
  setSelectionFailed: (hasStorageRoleLabel: boolean) => void;
}

const useNodeSelectionState = (
  node: IoK8sApiCoreV1Node
): [NodeSelectionState, NodeSelectionActions] => {
  const isSelected = hasLabel(node, STORAGE_ROLE_LABEL);
  const [memoryValue] = getMemory(node);

  const [state, setState] = useState<NodeSelectionState>({
    uid: getUid(node) ?? VALUE_NOT_AVAILABLE,
    name: getName(node) ?? VALUE_NOT_AVAILABLE,
    role: getRole(node) ?? VALUE_NOT_AVAILABLE,
    cpu: getCpu(node) ?? VALUE_NOT_AVAILABLE,
    memory: memoryValue ? memoryValue : VALUE_NOT_AVAILABLE,
    isSelected,
    isSelectionPending: false,
  });

  const actions = useMemo(
    () => ({
      setSelectionPending: (checked: boolean) => {
        setState((s) => ({
          ...s,
          isSelectionPending: true,
          isSelected: checked,
        }));
      },
      setSelectionSucceeded: (checked: boolean) => {
        setState((s) => ({
          ...s,
          isSelectionPending: false,
          isSelected: checked,
        }));
      },
      setSelectionFailed: (hasStorageRoleLabel: boolean) => {
        setState((s) => ({
          ...s,
          isSelectionPending: false,
          isSelected: hasStorageRoleLabel,
        }));
      },
    }),
    []
  );

  return [state, actions];
};
