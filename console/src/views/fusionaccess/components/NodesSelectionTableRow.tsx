import {
  type RowProps,
  TableData,
} from "@openshift-console/dynamic-plugin-sdk";
import { Checkbox } from "@patternfly/react-core";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import { useNodeSelectionState } from "../hooks/useNodeSelectionState";
import type { NodesSelectionTableRowDataProps } from "./NodesSelectionSection";
import { useNodeSharedDisksCount } from "../hooks/useNodeSharedDisksCount";

type NodesSelectionTableRowProps = RowProps<
  IoK8sApiCoreV1Node,
  NodesSelectionTableRowDataProps
>;
export const NodesSelectionTableRow: React.FC<NodesSelectionTableRowProps> = (
  props
) => {
  const { obj, activeColumnIDs, rowData } = props;
  const { disksDiscoveryResults, selectedNodes } = rowData;

  const {
    uid,
    name,
    role,
    cpu,
    memory,
    isSelected,
    handleNodeSelectionChange,
  } = useNodeSelectionState(obj);
  const totalDisksCount = disksDiscoveryResults.find(
    (result) => result.spec.nodeName === name
  )?.status.discoveredDevices?.length;
  const sharedDisksCount = useNodeSharedDisksCount(
    name,
    isSelected,
    selectedNodes,
    disksDiscoveryResults
  );

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
          onChange={handleNodeSelectionChange}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        {name}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="role">
        {role}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="cpu">
        {cpu}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="memory">
        {memory}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="disks">
        {sharedDisksCount} shared / {totalDisksCount} total
      </TableData>
    </>
  );
};
