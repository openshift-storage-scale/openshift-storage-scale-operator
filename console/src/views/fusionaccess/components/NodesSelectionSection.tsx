import { Trans } from "react-i18next";
import {
  VirtualizedTable,
  useK8sWatchResource,
} from "@openshift-console/dynamic-plugin-sdk";
import { Alert, PageSection } from "@patternfly/react-core";
import { usePluginTranslations } from "@/hooks/usePluginTranslations";
import { usePageContext } from "@/hooks/usePageContext";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import { LocalVolumeDiscoveryResultModel } from "@/models/fusionstorage/LocalVolumeDiscoveryResultModel";
import { useNodesSelectionTableColumns } from "@/views/fusionaccess/hooks/useNodesSelectionTableColumns";
import { NodesSelectionTableRow } from "./NodesSelectionTableRow";
import type { LocalVolumeDiscoveryResult } from "@/models/fusionstorage/LocalVolumeDiscoveryResult";
import { useNodeSharedDisksCounts } from "../hooks/useSharedDisksCount";
import { useConstants } from "@/hooks/useConstants";
import { useLabelKeyValue } from "@/hooks/useLabelKeyValue";

export type NodesSelectionTableRowDataProps = {
  nodeSharedDisksCounts: Map<string, number>;
};

export const NodesSelectionSection: React.FC = () => {
  usePageContext({ pageDescription: " " });
  const { t } = usePluginTranslations();
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
    groupVersionKind: LocalVolumeDiscoveryResultModel.toGroupVersionKind(),
  });
  const nodeSharedDisksCounts = useNodeSharedDisksCounts(disksDiscoveryResults);
  const columns = useNodesSelectionTableColumns();
  const validationFailuresCount = 0; // TODO(jkilzi): Implement validation failures count

  return (
    <>
      <Alert
        variant="info"
        title={
          <Trans t={t}>
            Make sure all nodes for the storage cluster are selected before you
            continue.
            <br />
            Worker nodes will be rebooted while creating the storage cluster.
          </Trans>
        }
      />
      <VirtualizedTable<IoK8sApiCoreV1Node, NodesSelectionTableRowDataProps>
        data={nodes}
        unfilteredData={nodes}
        columns={columns}
        loaded={nodesLoaded}
        loadError={nodesLoadedError}
        Row={NodesSelectionTableRow}
        rowData={{ nodeSharedDisksCounts }}
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
