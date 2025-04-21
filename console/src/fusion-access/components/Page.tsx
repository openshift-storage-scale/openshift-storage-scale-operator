import { useLayoutEffect } from "react";
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
import { useWatchSpectrumScaleCluster } from "../hooks/useWatchSpectrumScaleCluster";
import { useWatchFusionAccess } from "../hooks/useWatchFusionAccess";
import { useGlobalStateContext } from "../contexts/global-state/GlobalStateContext";
import { DownloadLogsButton } from "./DownloadLogsButton";
import { CreateStorageClusterButton } from "./CreateStorageClusterButton";
import { usePageSectionRouter } from "../hooks/usePageSectionRouter";
import { useWatchNode } from "../hooks/useWatchNode";
import { useSelectedNodes } from "../hooks/useSelectedNodes";
import { useTriggerAlertsOnErrors } from "../hooks/useTriggerAlertsOnErrors";
import { useCreateStorageClusterHandler } from "../hooks/useCreateStorageClusterHandler";

export const Page: React.FC = () => {
  const [state, dispatch] = useGlobalStateContext();

  useLayoutEffect(() => {
    // Ensure the <ListPageBody> takes full height, to allow displaying warnings at the bottom of the same section
    // It's a workaround for the <ListPageBody> not forwarding the styles prop
    const listPageBody = document.querySelector<HTMLDivElement>(
      "#content-scrollable > section > div.co-m-pane__body"
    );
    if (listPageBody) {
      listPageBody.style.display = "flex";
      listPageBody.style.flexDirection = "column";
      listPageBody.style.height = "100%";
    }
  }, []);

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

  return (
    <>
      <Helmet>
        <title data-testid="document-title">{state.page.documentTitle}</title>
      </Helmet>

      <ListPageHeader
        title={state.page.title}
        helpText={state.page.description}
      >
        {state.page.ctas.downloadLogs.isHidden ? null : (
          <DownloadLogsButton key={"download-logs"} onDownloadLogs={() => {}} />
        )}
        {state.page.ctas.createStorageCluster.isHidden ? null : (
          <CreateStorageClusterButton
            key={"create-storage-cluster"}
            isDisabled={selectedNodes.length < 3}
            onCreateStorageCluster={handleCreateStorageCluster}
          />
        )}
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
                alert.dismissable ? (
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
Page.displayName = "FusionAccessPage";
