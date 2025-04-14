import {
  VirtualizedTable,
  useK8sWatchResource,
} from "@openshift-console/dynamic-plugin-sdk";
import { Alert } from "@patternfly/react-core";
import { usePluginTranslations } from "@/hooks/usePluginTranslations";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/types-1.30";
import { NodesSelectionTableRow } from "./NodesSelectionTableRow";
import { useNodesSelectionTableColumns } from "../hooks/useNodesSelectionTableColumns";
import { usePageContext } from "@/hooks/usePageContext";

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
  });

  const columns = useNodesSelectionTableColumns();

  return (
    <>
      <Alert
        variant="info"
        title={
          <>
            {t(
              "Make sure all nodes for the storage cluster are selected before you continue."
            )}
            <br />
            {t(
              "Worker nodes will be rebooted while creating the storage cluster."
            )}
          </>
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
    </>
  );
};

NodesSelectionSection.displayName = "NodesSelectionSection";
