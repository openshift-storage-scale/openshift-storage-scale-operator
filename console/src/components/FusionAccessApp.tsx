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
import { useStoreContext } from "@/hooks/useStoreContext";
import { DownloadLogsButton } from "./DownloadLogsButton";
import { CreateStorageClusterButton } from "./CreateStorageClusterButton";
import { usePageSectionRouter } from "@/hooks/usePageSectionRouter";
import { useWatchNode } from "@/hooks/useWatchNode";
import { useSelectedNodes } from "@/hooks/useSelectedNodes";
import { useTriggerAlertsOnErrors } from "@/hooks/useTriggerAlertsOnErrors";
import { useCreateStorageClusterHandler } from "@/hooks/useCreateStorageClusterHandler";
import { CreateFileSystemButton } from "./CreateFileSystemButton";
import { useCreateFileSystemHandler } from "@/hooks/useCreateFileSystemHandler";
import { useTweakListPageBodyHeaderStyle } from "@/hooks/useTweakListPageBodyHeaderStyle";
import { useDownloadLogsHandler } from "@/hooks/useDownloadLogsHandler";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";

export const FusionAccessApp: React.FC = () => {
  const [state, dispatch] = useStoreContext();
  const { t } = useFusionAccessTranslations();

  useTweakListPageBodyHeaderStyle({
    isFlex: true,
    isFilled: true,
    direction: "column",
    justification: "space-between",
  });

  const [nodes, _nodesLoaded, nodesWatchError] = useWatchNode({
    role: "worker",
    isList: true,
  });
  const selectedNodes = useSelectedNodes(nodes);

  const [
    spectrumScaleClustersList,
    spectrumScaleClustersListLoaded,
    spectrumScaleClustersListWatchError,
  ] = useWatchSpectrumScaleCluster({ isList: true, limit: 1 });

  const [
    fusionAccessesList,
    fusionAccessesListLoaded,
    fusionAccessesListWatchError,
  ] = useWatchFusionAccess({ isList: true, limit: 1 });

  useTriggerAlertsOnErrors(
    nodesWatchError && t("Nodes load failed"),
    fusionAccessesListWatchError && t("FusionAccess load failed"),
    spectrumScaleClustersListWatchError && t("Storage cluster load failed")
  );

  const section = usePageSectionRouter({
    spectrumScaleClustersList,
    spectrumScaleClustersListLoaded,
    fusionAccessesList,
    fusionAccessesListLoaded,
  });

  const handleDownloadLogs = useDownloadLogsHandler();
  const handleCreateStorageCluster = useCreateStorageClusterHandler();
  const handleCreateFileSystem = useCreateFileSystemHandler();

  return (
    <>
      <Helmet>
        <title data-testid="document-title">{state.global.documentTitle}</title>
      </Helmet>

      <ListPageHeader
        title={state.page.title}
        helpText={state.page.description}
      >
        <DownloadLogsButton
          key={"download-logs"}
          isDisabled={state.ctas.downloadLogs.isDisabled}
          isHidden={state.ctas.downloadLogs.isHidden}
          onDownloadLogs={handleDownloadLogs}
        />
        <CreateStorageClusterButton
          key={"create-storage-cluster"}
          isDisabled={selectedNodes.length < 3}
          isHidden={state.ctas.createStorageCluster.isHidden}
          onCreateStorageCluster={handleCreateStorageCluster}
        />
        <CreateFileSystemButton
          key={"create-file-system"}
          isDisabled={state.ctas.createFileSystem.isDisabled}
          isHidden={state.ctas.createFileSystem.isHidden}
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
                    variantLabel={alert.variant}
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
FusionAccessApp.displayName = "FusionAccessApp";
