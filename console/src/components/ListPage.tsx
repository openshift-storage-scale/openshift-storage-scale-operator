import { Helmet } from "react-helmet";
import {
  ListPageBody,
  ListPageHeader,
} from "@openshift-console/dynamic-plugin-sdk";
import {
  Alert,
  AlertGroup,
  AlertActionCloseButton,
} from "@patternfly/react-core";
import { useWatchSpectrumScaleCluster } from "@/hooks/useWatchSpectrumScaleCluster";
import { useWatchFusionAccess } from "@/hooks/useWatchFusionAccess";
import { useGlobalStateContext } from "@/hooks/useGlobalStateContext";
import { DownloadLogsButton } from "./DownloadLogsButton";
import { CreateStorageClusterButton } from "./CreateStorageClusterButton";
import { usePageSectionRouter } from "@/hooks/usePageSectionRouter";
import { useWatchNode } from "@/hooks/useWatchNode";
import { useSelectedNodes } from "@/hooks/useSelectedNodes";
import { useTriggerAlertsOnErrors } from "@/hooks/useTriggerAlertsOnErrors";
import { useCreateStorageClusterHandler } from "@/hooks/useCreateStorageClusterHandler";
import { CreateFileSystemButton } from "./CreateFileSystemButton";
import { useCreateFileSystemHandler } from "@/hooks/useCreateFileSystemHandler";
import { useListPageBodyHeaderStyle } from "@/hooks/useListPageBodyHeaderStyle";

export const ListPage: React.FC = () => {
  const [state, dispatch] = useGlobalStateContext();

  useListPageBodyHeaderStyle({
    isFlex: true,
    isFilled: true,
    direction: "column",
    alignment: "center",
    justifcation: "space-around",
  });

  const [nodes, _nodesLoaded, nodesError] = useWatchNode({
    role: "worker",
    isList: true,
  });
  const selectedNodes = useSelectedNodes(nodes);

  const [
    spectrumScaleClustersList,
    spectrumScaleClustersListLoaded,
    spectrumScaleClustersListWatchError,
  ] = useWatchSpectrumScaleCluster({ isList: true });

  const [
    fusionAccessesList,
    fusionAccessesListLoaded,
    fusionAccessesListWatchError,
  ] = useWatchFusionAccess({ isList: true });

  useTriggerAlertsOnErrors(
    nodesError,
    fusionAccessesListWatchError,
    spectrumScaleClustersListWatchError
  );

  const section = usePageSectionRouter({
    spectrumScaleClustersList,
    spectrumScaleClustersListLoaded,
    fusionAccessesList,
    fusionAccessesListLoaded,
  });

  const handleCreateStorageCluster = useCreateStorageClusterHandler();
  const handleCreateFileSystem = useCreateFileSystemHandler();

  return (
    <>
      <Helmet>
        <title data-testid="document-title">{state.page.documentTitle}</title>
      </Helmet>

      <ListPageHeader
        title={state.page.title}
        helpText={state.page.description}
      >
        <DownloadLogsButton
          key={"download-logs"}
          onDownloadLogs={() => {}}
          isHidden={state.page.ctas.downloadLogs.isHidden}
        />
        <CreateStorageClusterButton
          key={"create-storage-cluster"}
          isDisabled={selectedNodes.length < 3}
          isHidden={state.page.ctas.createStorageCluster.isHidden}
          onCreateStorageCluster={handleCreateStorageCluster}
        />
        <CreateFileSystemButton
          key={"create-file-system"}
          isHidden={state.page.ctas.createFileSystem.isHidden}
          onCreateFileSystem={handleCreateFileSystem}
        />
      </ListPageHeader>

      <ListPageBody>
        {section}
        <AlertGroup isLiveRegion>
          {state.alerts.map((alert) => (
            <Alert
              isInline
              key={alert.key}
              variant={alert.variant}
              title={alert.title}
              actionClose={
                alert.isDismissable ? (
                  <AlertActionCloseButton
                    title={alert.title as string}
                    variantLabel={`${alert.variant}`}
                    onClose={() => {
                      dispatch({
                        type: "removeAlert",
                        payload: alert,
                      });
                    }}
                  />
                ) : null
              }
            >
              {alert.description}
            </Alert>
          ))}
        </AlertGroup>
      </ListPageBody>
    </>
  );
};
ListPage.displayName = "ListPage";
