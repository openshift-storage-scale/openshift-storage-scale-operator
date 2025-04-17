import { useCallback } from "react";
import {
  k8sPatch,
  type RowProps,
  TableData,
} from "@openshift-console/dynamic-plugin-sdk";
import { Checkbox } from "@patternfly/react-core";
import { useConstants } from "@/hooks/useConstants";
import { useLabelKeyValue } from "@/hooks/useLabelKeyValue";
import { NodeModel } from "@/models/console/NodeModel";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import { getLabels, hasLabel } from "@/selectors/console/K8sResourceCommon";
import type { NodesSelectionTableRowDataProps } from "./NodesSelectionSection";
import {
  useNodeSelectionState,
  type NodeSelectionChangeHandler,
} from "../hooks/useNodeSelectionState";
import { useNodeSharedDisksCount } from "../hooks/useNodeSharedDisksCount";

type NodesSelectionTableRowProps = RowProps<
  IoK8sApiCoreV1Node,
  NodesSelectionTableRowDataProps
>;
export const NodesSelectionTableRow: React.FC<NodesSelectionTableRowProps> = (
  props
) => {
  const { obj: node, activeColumnIDs, rowData } = props;
  const { disksDiscoveryResults, selectedNodes } = rowData;

  const [
    { uid, name, role, cpu, memory, isSelected, isSelectionInProgress },
    setNodeSelectionState,
  ] = useNodeSelectionState(node);

  const { STORAGE_ROLE_LABEL } = useConstants();
  const [storageRoleLabelKey, storageRoleLabelValue] =
    useLabelKeyValue(STORAGE_ROLE_LABEL);

  const totalDisksCount = disksDiscoveryResults.find(
    (result) => result.spec.nodeName === name
  )?.status.discoveredDevices?.length;
  const sharedDisksCount = useNodeSharedDisksCount(
    name,
    isSelected,
    selectedNodes,
    disksDiscoveryResults
  );

  const handleNodeSelectionChange = useCallback<NodeSelectionChangeHandler>(
    (_, checked) => {
      if (isSelectionInProgress) {
        return;
      }

      const labels = getLabels(node);
      if (!labels) {
        return;
      }

      if (checked) {
        labels[storageRoleLabelKey] = storageRoleLabelValue;
      } else {
        if (storageRoleLabelKey in labels) {
          delete labels[storageRoleLabelKey];
        }
      }

      k8sPatch({
        data: [
          {
            op: "replace",
            path: "/metadata/labels",
            value: labels,
          },
        ],
        model: NodeModel,
        resource: node,
      })
        .then(() => {
          setNodeSelectionState((s) => ({
            ...s,
            isSelectionInProgress: false,
            selectionError: null,
            isSelected: checked,
          }));
        })
        .catch((error) => {
          setNodeSelectionState((s) => ({
            ...s,
            isSelectionInProgress: false,
            selectionError: error,
            isSelected: hasLabel(node, STORAGE_ROLE_LABEL),
          }));
        });

      setNodeSelectionState((s) => ({
        ...s,
        isSelectionInProgress: true,
        isSelected: checked,
      }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [node]
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
          isDisabled={isSelectionInProgress}
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
