import { useEffect } from "react";
import {
  VirtualizedTable,
  useK8sWatchResource,
} from "@openshift-console/dynamic-plugin-sdk";
import { Alert, Button, PageSection } from "@patternfly/react-core";
import { usePluginTranslations } from "@/hooks/usePluginTranslations";
import { usePageContext } from "@/hooks/usePageContext";
import { useConstants } from "@/hooks/useConstants";
import { useLabelKeyValue } from "@/hooks/useLabelKeyValue";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import type { LocalVolumeDiscoveryResult } from "@/models/fusionstorage/LocalVolumeDiscoveryResult";
import { NodesSelectionTableRow } from "./NodesSelectionTableRow";
import { useNodesSelectionTableColumns } from "../hooks/useNodesSelectionTableColumns";
import { useNodesSelected } from "../hooks/useNodesSelected";

export type NodesSelectionTableRowDataProps = {
  disksDiscoveryResults: LocalVolumeDiscoveryResult[];
  selectedNodes: IoK8sApiCoreV1Node[];
};

export const NodesSelectionSection: React.FC = () => {
  const { t } = usePluginTranslations();
  const pageContext = usePageContext({
    pageDescription: t(
      "To create a storage cluster select at least 3 nodes that share the same amount of disks."
    ),
  });
  const { WORKER_NODE_ROLE_LABEL } = useConstants();
  const [workerNodeRoleLabelKey, workerNodeRoleLabelValue] = useLabelKeyValue(
    WORKER_NODE_ROLE_LABEL
  );

  const [nodes, nodesLoaded, nodesLoadedError] = useK8sWatchResource<
    IoK8sApiCoreV1Node[]
  >({
    isList: true,
    groupVersionKind: {
      version: "v1",
      kind: "Node",
    },
    // TODO(jkilzi): For now, we are allowing only to select workers.
    selector: {
      matchLabels: {
        [workerNodeRoleLabelKey]: workerNodeRoleLabelValue,
      },
    },
  });

  const [
    disksDiscoveryResults,
    // // TODO(jkilzi): We need a UX for disksDiscoveryResultLoaded
    // disksDiscoveryResultsLoaded,
    // // TODO(jkilzi): We need a UX for disksDiscoveryResultLoadedError
    // disksDiscoveryResultsLoadedError,
  ] = useK8sWatchResource<LocalVolumeDiscoveryResult[]>({
    isList: true,
    groupVersionKind: {
      group: "fusion.storage.openshift.io",
      version: "v1alpha1",
      kind: "LocalVolumeDiscoveryResult",
    },
  });

  const validationFailuresCount = 0; // TODO(jkilzi): Implement validation failures count
  const selectedNodes = useNodesSelected(nodes);

  useEffect(() => {
    const downloadLogsButton = pageContext.pageActions.find(
      ({ key }) => key === "download-logs-button"
    );
    pageContext.setPageActions(() => [
      <Button
        variant="primary"
        key="create-storage-cluster-button"
        isDisabled={selectedNodes.length < 3 || validationFailuresCount > 0}
        onClick={() => {}}
      >
        {t("Create storage cluster")}
      </Button>,
      downloadLogsButton!,
    ]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodes, validationFailuresCount]);

  const columns = useNodesSelectionTableColumns();

  return (
    <>
      <Alert
        variant="info"
        title={t(
          "Worker nodes will be rebooted while creating the storage cluster."
        )}
      />
      <VirtualizedTable<IoK8sApiCoreV1Node, NodesSelectionTableRowDataProps>
        data={nodes}
        unfilteredData={nodes}
        columns={columns}
        loaded={nodesLoaded}
        loadError={nodesLoadedError}
        Row={NodesSelectionTableRow}
        rowData={{ disksDiscoveryResults, selectedNodes }}
      />
      {validationFailuresCount > 0 && (
        <PageSection>
          {
            // TODO(jkilzi): render here any warnings or errors related to the nodes selection
            null
          }
        </PageSection>
      )}
    </>
  );
};

NodesSelectionSection.displayName = "NodesSelectionSection";
