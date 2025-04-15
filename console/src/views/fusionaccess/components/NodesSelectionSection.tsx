import {
  CodeEditor,
  VirtualizedTable,
  useK8sWatchResource,
} from "@openshift-console/dynamic-plugin-sdk";
import { Alert, PageSection } from "@patternfly/react-core";
import { usePluginTranslations } from "@/hooks/usePluginTranslations";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import { NodesSelectionTableRow } from "./NodesSelectionTableRow";
import { useNodesSelectionTableColumns } from "../hooks/useNodesSelectionTableColumns";
import { usePageContext } from "@/hooks/usePageContext";
import { Trans } from "react-i18next";
import { LocalVolumeDiscoveryResultModel } from "@/models/fusionstorage/LocalVolumeDiscoveryResultModel";

export const NodesSelectionSection: React.FC = () => {
  usePageContext({ pageDescription: " " });
  const { t } = usePluginTranslations();
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
        "node-role.kubernetes.io/worker": "",
      },
    },
  });
  const [
    disksDiscoveryResult,
    // // TODO(jkilzi): We need a UX for disksDiscoveryResultLoaded
    // disksDiscoveryResultLoaded,
    // // TODO(jkilzi): We need a UX for disksDiscoveryResultLoadedError
    // disksDiscoveryResultLoadedError,
  ] = useK8sWatchResource({
    isList: true,
    groupVersionKind: LocalVolumeDiscoveryResultModel.toGroupVersionKind(),
  });

  const columns = useNodesSelectionTableColumns();

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
      <VirtualizedTable<IoK8sApiCoreV1Node>
        data={nodes}
        unfilteredData={nodes}
        columns={columns}
        loaded={nodesLoaded}
        loadError={nodesLoadedError}
        Row={NodesSelectionTableRow}
      />
      <PageSection>
        <CodeEditor
          minHeight="480px"
          value={JSON.stringify(disksDiscoveryResult, null, 2)}
        />
      </PageSection>
    </>
  );
};

NodesSelectionSection.displayName = "NodesSelectionSection";
