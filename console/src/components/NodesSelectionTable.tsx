import {
  VirtualizedTable,
  type TableColumn,
} from "@openshift-console/dynamic-plugin-sdk";
import { Alert, Stack, StackItem } from "@patternfly/react-core";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import { useWatchNode } from "@/hooks/useWatchNode";
import {
  MIN_AMOUNT_OF_NODES_MSG_DIGEST,
  MINIMUM_AMOUNT_OF_MEMORY,
  MINIMUM_AMOUNT_OF_NODES,
  WORKER_NODE_ROLE_LABEL,
} from "@/constants";
import { useTriggerAlertsOnErrors } from "@/hooks/useTriggerAlertsOnErrors";
import { useWatchLocalVolumeDiscoveryResult } from "@/hooks/useWatchLocalVolumeDiscoveryResult";
import type { LocalVolumeDiscoveryResult } from "@/models/fusion-access/LocalVolumeDiscoveryResult";
import { NodesSelectionTableRow } from "./NodesSelectionTableRow";
import { NodesSelectionEmptyState } from "./NodesSelectionEmptyState";
import { useStoreContext } from "@/contexts/store/context";
import type { State, Actions } from "@/contexts/store/types";
import { useEffect, useMemo } from "react";
import {
  getNodesWithMinimumAmountOfMemory,
  getSelectedNodes,
} from "@/utils/kubernetes/1.30/IoK8sApiCoreV1Node";

export const NodesSelectionTable: React.FC = () => {
  const { t } = useFusionAccessTranslations();

  const [nodes, nodesLoaded, nodesLoadedError] = useWatchNode({
    withLabels: [WORKER_NODE_ROLE_LABEL],
    isList: true,
  });
  const [
    disksDiscoveryResults,
    disksDiscoveryResultsLoaded,
    disksDiscoveryResultsError,
  ] = useWatchLocalVolumeDiscoveryResult({ isList: true });
  const isLoading = !nodesLoaded || !disksDiscoveryResultsLoaded;

  useTriggerAlertsOnErrors(nodesLoadedError, disksDiscoveryResultsError);

  const nodesWithMinimumAmountOfMemory =
    getNodesWithMinimumAmountOfMemory(nodes);

  useValidateStorageClusterMinimumRequirements(
    nodesWithMinimumAmountOfMemory,
    isLoading
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
        <VirtualizedTable<
          IoK8sApiCoreV1Node,
          {
            nodes: IoK8sApiCoreV1Node[];
            disksDiscoveryResults: LocalVolumeDiscoveryResult[];
          }
        >
          data={nodesWithMinimumAmountOfMemory}
          unfilteredData={nodesWithMinimumAmountOfMemory}
          columns={columns}
          loaded={!isLoading}
          loadError={nodesLoadedError || disksDiscoveryResultsError}
          Row={NodesSelectionTableRow}
          rowData={{
            nodes: nodesWithMinimumAmountOfMemory,
            disksDiscoveryResults,
          }}
          EmptyMsg={NodesSelectionEmptyState}
        />
      </StackItem>
    </Stack>
  );
};
NodesSelectionTable.displayName = "NodesSelectionTable";

const useValidateStorageClusterMinimumRequirements = (
  nodesWithMinimumAmountOfMemory: IoK8sApiCoreV1Node[],
  isLoading: boolean
) => {
  const [, dispatch] = useStoreContext<State, Actions>();
  const { t } = useFusionAccessTranslations();
  const selectedNodes = getSelectedNodes(nodesWithMinimumAmountOfMemory);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const description = t(
      "At least {{MINIMUM_AMOUNT_OF_NODES}} nodes are required.",
      {
        MINIMUM_AMOUNT_OF_NODES,
      }
    );

    if (selectedNodes.length < MINIMUM_AMOUNT_OF_NODES) {
      dispatch({
        type: "updateCtas",
        payload: { createStorageCluster: { isDisabled: true } },
      });
      dispatch({
        type: "addAlert",
        payload: {
          key: MIN_AMOUNT_OF_NODES_MSG_DIGEST,
          variant: "warning",
          title: t("Storage cluster requirements"),
          description,
          isDismissable: false,
        },
      });
    } else {
      dispatch({
        type: "updateCtas",
        payload: { createStorageCluster: { isDisabled: false } },
      });
      dispatch({
        type: "removeAlert",
        payload: { key: MIN_AMOUNT_OF_NODES_MSG_DIGEST },
      });
    }
  }, [dispatch, isLoading, selectedNodes, t]);
};

const useNodesSelectionTableColumns = (): TableColumn<IoK8sApiCoreV1Node>[] => {
  const { t } = useFusionAccessTranslations();
  return useMemo(
    () => [
      {
        id: "checkbox",
        title: "",
        props: { className: "pf-v5-c-table__check" },
      },
      {
        id: "name",
        title: t("Name"),
      },
      {
        id: "role",
        title: t("Role"),
        props: { className: "pf-v5-u-text-align-center" },
      },
      {
        id: "cpu",
        title: t("CPU"),
        props: { className: "pf-v5-u-text-align-center" },
      },
      {
        id: "memory",
        title: t("Memory"),
        props: { className: "pf-v5-u-text-align-center" },
      },
      {
        id: "shared-disks",
        title: t("Shared disks"),
        props: { className: "pf-v5-u-text-align-center" },
      },
    ],
    [t]
  );
};
