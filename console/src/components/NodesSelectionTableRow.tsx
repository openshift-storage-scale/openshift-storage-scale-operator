import {
  type RowProps,
  TableData,
} from "@openshift-console/dynamic-plugin-sdk";
import { Checkbox } from "@patternfly/react-core";
import { useSelectNodeHandler } from "@/hooks/useSelectNodeHandler";
import { useSharedDisksCount } from "@/hooks/useSharedDisksCount";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import type { LocalVolumeDiscoveryResult } from "@/models/fusion-access/LocalVolumeDiscoveryResult";
import { getSelectedNodes } from "@/utils/kubernetes/1.30/IoK8sApiCoreV1Node";
import { useNodeSelectionState } from "@/hooks/useNodeSelectionState";

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
