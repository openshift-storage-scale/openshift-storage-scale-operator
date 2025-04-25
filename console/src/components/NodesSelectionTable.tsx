import { VirtualizedTable } from "@openshift-console/dynamic-plugin-sdk";
import { Alert, Stack, StackItem } from "@patternfly/react-core";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import { useNodesSelectionTableColumns } from "@/hooks/useNodesSelectionTableColumns";
import { useWatchNode } from "@/hooks/useWatchNode";
import { MINIMUM_AMOUNT_OF_MEMORY } from "@/constants";
import { useNodesWithMinimumAmountOfMemory } from "@/hooks/useNodesWithMinimumAmountOfMemory";
import { useTriggerAlertsOnErrors } from "@/hooks/useTriggerAlertsOnErrors";
import { useWatchLocalVolumeDiscoveryResult } from "@/hooks/useWatchLocalVolumeDiscoveryResult";
import { useValidateStorageClusterMinimumRequirements } from "@/hooks/useValidateStorageClusterMinimumRequirements";
import type { LocalVolumeDiscoveryResult } from "@/models/fusion-access/LocalVolumeDiscoveryResult";
import { NodesSelectionTableRow } from "./NodesSelectionTableRow";
import { NodesSelectionEmptyState } from "./NodesSelectionEmptyState";

export const NodesSelectionTable: React.FC = () => {
  const { t } = useFusionAccessTranslations();

  const [nodes, nodesLoaded, nodesLoadedError] = useWatchNode({
    role: "worker",
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
    useNodesWithMinimumAmountOfMemory(nodes);

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
