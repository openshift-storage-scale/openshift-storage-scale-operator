import { useEffect } from "react";
import {
  TableData,
  VirtualizedTable,
  type RowProps,
} from "@openshift-console/dynamic-plugin-sdk";
import { Alert, Checkbox, Stack, StackItem } from "@patternfly/react-core";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import { useNodesSelectionTableColumns } from "@/hooks/useNodesSelectionTableColumns";
import { useStoreContext } from "@/hooks/useStoreContext";
import { useWatchNode } from "@/hooks/useWatchNode";
import { useWatchLocalVolumeDiscoveryResult } from "@/hooks/useWatchLocalVolumeDiscoveryResult";
import { MINIMUM_AMOUNT_OF_MEMORY, MINIMUM_AMOUNT_OF_NODES } from "@/constants";
import { useNodeSelectionState } from "@/hooks/useNodeSelectionState";
import { useSharedDisksCount } from "@/hooks/useSharedDisksCount";
import { useSelectedNodes } from "@/hooks/useSelectedNodes";
import { useTriggerAlertsOnErrors } from "@/hooks/useTriggerAlertsOnErrors";
import { useNodesWithMinimumAmountOfMemory } from "@/hooks/useNodesWithMinimumAmountOfMemory";
import { useNodeSelectionHandler } from "@/hooks/useNodeSelectionHandler";
import { useTweakListPageBodyHeaderStyle } from "@/hooks/useTweakListPageBodyHeaderStyle";
import { useMinimumNodesMemoryAlert } from "@/hooks/useMinimumNodesMemoryAlert";

export const NodesSelection: React.FC = () => {
  const { t } = useFusionAccessTranslations();
  const [, dispatch] = useStoreContext();

  useEffect(() => {
    dispatch({
      type: "updatePage",
      payload: {
        description: t(
          "To create a storage cluster select at least {{MINIMUM_AMOUNT_OF_NODES}} nodes that share the same amount of disks.",
          { MINIMUM_AMOUNT_OF_NODES }
        ),
      },
    });
    dispatch({
      type: "updateCtas",
      payload: {
        createStorageCluster: {
          isDisabled: true,
          isHidden: false,
        },
      },
    });
  }, [dispatch, t]);

  const [nodes, nodesLoaded, nodesLoadedError] = useWatchNode({
    role: "worker",
    isList: true,
  });

  const nodesWithMinimumAmountOfMemory =
    useNodesWithMinimumAmountOfMemory(nodes);

  useMinimumNodesMemoryAlert(nodesWithMinimumAmountOfMemory);

  const columns = useNodesSelectionTableColumns();

  return (
    <Stack hasGutter>
      <StackItem>
        <Alert
          isInline
          variant="info"
          title={t(
            "Only worker nodes with a minimum of {{MINIMUM_AMOUNT_OF_MEMORY}} of RAM are displayed.",
            { MINIMUM_AMOUNT_OF_MEMORY }
          )}
        />
      </StackItem>
      <StackItem isFilled>
        <VirtualizedTable<IoK8sApiCoreV1Node, Array<IoK8sApiCoreV1Node>>
          data={nodesWithMinimumAmountOfMemory}
          unfilteredData={nodesWithMinimumAmountOfMemory}
          columns={columns}
          loaded={nodesLoaded}
          loadError={nodesLoadedError}
          Row={NodesSelectionTableRow}
          rowData={nodesWithMinimumAmountOfMemory}
          // EmptyMsg={NodeSeletionTableEmptyState} // TODO(jkilzi): Impl. NodeSeletionTableEmptyState
        />
      </StackItem>
    </Stack>
  );
};
NodesSelection.displayName = "NodesSelection";

type NodesSelectionTableRowProps = RowProps<
  IoK8sApiCoreV1Node,
  Array<IoK8sApiCoreV1Node>
>;
const NodesSelectionTableRow: React.FC<NodesSelectionTableRowProps> = (
  props
) => {
  const { activeColumnIDs, obj: node, rowData: nodes } = props;

  useTweakListPageBodyHeaderStyle({
    isFlex: true,
    isFilled: true,
    direction: "column",
  });

  const [disksDiscoveryResults, , disksDiscoveryResultsError] =
    useWatchLocalVolumeDiscoveryResult({ isList: true });

  useTriggerAlertsOnErrors(disksDiscoveryResultsError);

  const selectedNodes = useSelectedNodes(nodes);

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

  const handleNodeSelection = useNodeSelectionHandler({
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
