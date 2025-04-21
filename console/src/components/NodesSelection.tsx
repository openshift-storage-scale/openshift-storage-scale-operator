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
import { useGlobalStateContext } from "@/hooks/useGlobalStateContext";
import { useWatchNode } from "@/hooks/useWatchNode";
import { useWatchLocalVolumeDiscoveryResult } from "@/hooks/useWatchLocalVolumeDiscoveryResult";
import { MINIMUM_AMOUNT_OF_MEMORY, MINIMUM_AMOUNT_OF_NODES } from "@/constants";
import { useNodeSelectionState } from "@/hooks/useNodeSelectionState";
import { useSharedDisksCount } from "@/hooks/useSharedDisksCount";
import { useSelectedNodes } from "@/hooks/useSelectedNodes";
import { useTriggerAlertsOnErrors } from "@/hooks/useTriggerAlertsOnErrors";
import { useNodesWithMinimumAmountOfMemory } from "@/hooks/useNodesWithMinimumAmountOfMemory";
import { useNodeSelectionHandler } from "@/hooks/useNodeSelectionHandler";
import { useListPageBodyHeaderStyle } from "@/hooks/useListPageBodyHeaderStyle";

export const NodesSelection: React.FC = () => {
  const { t } = useFusionAccessTranslations();
  const [state, dispatch] = useGlobalStateContext();

  useEffect(
    () => {
      dispatch({
        type: "updatePageDescription",
        payload: t(
          "To create a storage cluster select at least {{MINIMUM_AMOUNT_OF_NODES}} nodes that share the same amount of disks.",
          { MINIMUM_AMOUNT_OF_NODES }
        ),
      });
      dispatch({
        type: "updateCreateStorageClusterCta",
        payload: {
          isDisabled: true,
          isHidden: false,
        },
      });
    },
    // Safe to ignore: 't' and 'dispatch'
    []
  );

  const [nodes, nodesLoaded, nodesLoadedError] = useWatchNode({
    role: "worker",
    isList: true,
  });

  const nodesWithMinimumAmountOfMemory =
    useNodesWithMinimumAmountOfMemory(nodes);

  useEffect(
    () => {
      const alertDescription = t(
        "At least {{MINIMUM_AMOUNT_OF_NODES}} nodes are required, each with a minimum of {{MINIMUM_AMOUNT_OF_MEMORY}} of RAM.",
        {
          MINIMUM_AMOUNT_OF_NODES,
          MINIMUM_AMOUNT_OF_MEMORY,
        }
      );
      const weHaveAnAlertWithThisDescriptionAlready = state.alerts.find(
        (alert) => alert.description === alertDescription
      );
      if (weHaveAnAlertWithThisDescriptionAlready) {
        return;
      }

      if (nodesWithMinimumAmountOfMemory.length < 3) {
        dispatch({
          type: "addAlert",
          payload: {
            key: Date.now(),
            variant: "warning",
            title: t("Storage cluster requirements"),
            description: alertDescription,
            isDismissable: false,
          },
        });
      } else {
        state.alerts
          .filter((alert) => alert.description === alertDescription)
          .map((alert) => alert.key)
          .forEach((key) => {
            dispatch({ type: "removeAlert", payload: { key, title: "IDC" } });
          });
      }
    },
    // Safe to ignore: 't' and 'dispatch'
    [state.alerts, nodesWithMinimumAmountOfMemory.length]
  );

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

  useListPageBodyHeaderStyle({
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
