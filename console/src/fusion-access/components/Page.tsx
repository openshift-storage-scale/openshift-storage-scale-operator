import { useCallback, useLayoutEffect } from "react";
import { Helmet } from "react-helmet";
import {
  ListPageBody,
  ListPageHeader,
  useK8sModel,
  k8sCreate,
} from "@openshift-console/dynamic-plugin-sdk";
import {
  Alert,
  AlertGroup,
  AlertActionCloseButton,
} from "@patternfly/react-core";
import { useWatchSpectrumScaleCluster } from "../hooks/useWatchSpectrumScaleCluster";
import { useWatchFusionAccess } from "../hooks/useWatchFusionAccess";
import { useGlobalStateContext } from "../contexts/global-state/GlobalStateContext";
import { STORAGE_ROLE_LABEL } from "../constants";
import { DownloadLogsButton } from "./DownloadLogsButton";
import { CreateStorageClusterButton } from "./CreateStorageClusterButton";
import { usePageSectionRouter } from "../hooks/usePageSectionRouter";
import { useWatchNode } from "../hooks/useWatchNode";
import { useSelectedNodes } from "../hooks/useSelectedNodes";
import { useTriggerAlertsOnErrors } from "../hooks/useTriggerAlertsOnErrors";
import { usePluginTranslations } from "@/hooks/usePluginTranslations";
import type { Cluster } from "@/models/ibm-spectrum-scale/Cluster";

const [storageRoleLabelKey, storageRoleLabelValue] =
  STORAGE_ROLE_LABEL.split("=");
const nodeSelector = { [storageRoleLabelKey]: storageRoleLabelValue };

export const Page: React.FC = () => {
  const [state, dispatch] = useGlobalStateContext();
  const { t } = usePluginTranslations();

  useLayoutEffect(() => {
    // Ensure the body takes full height, to allow displaying warnings at the bottom of the same section
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

  const [storageScaleClusterModel] = useK8sModel({
    group: "scale.spectrum.ibm.com",
    version: "v1beta1",
    kind: "Cluster",
  });

  const handleCreateStorageCluster = useCallback(
    async () => {
      try {
        await k8sCreate<Cluster>({
          model: storageScaleClusterModel,
          data: {
            apiVersion: "scale.spectrum.ibm.com/v1beta1",
            kind: "Cluster",
            metadata: { name: "ibm-spectrum-scale-cluster2" },
            spec: {
              license: { accept: true, license: "data-management" },
              pmcollector: {
                nodeSelector,
              },
              daemon: {
                nodeSelector,
              },
            },
          },
        });
      } catch (e) {
        dispatch({
          type: "addAlert",
          payload: {
            key: Date.now(),
            variant: "danger",
            title: t("An error occurred while creating resources "),
            description: (e as Error).message,
            dismissable: true,
          },
        });
      }
    },
    // Safe to ignore: 't', 'dispatch' and 'storageScaleClusterModel'
    []
  );

  return (
    <>
      <Helmet>
        <title data-testid="document-title">{state.page?.documentTitle}</title>
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
