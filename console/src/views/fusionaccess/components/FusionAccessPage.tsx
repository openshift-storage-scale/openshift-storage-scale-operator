import React from "react";
import {
  useK8sWatchResource,
  type K8sResourceCommon,
} from "@openshift-console/dynamic-plugin-sdk";
import { Button, EmptyStateIcon } from "@patternfly/react-core";
import { DownloadIcon, SearchIcon } from "@patternfly/react-icons";
import { usePluginTranslations } from "@/hooks/usePluginTranslations";
import { PageContextProvider } from "@/providers/PageContextProvider";
import { EmptyStateSection } from "./EmptyStateSection";
import { LoadingStateSection } from "./LoadingStateSection";
import { NodesSelectionSection } from "./NodesSelectionSection";

const FusionAccessPage: React.FC = () => {
  const { t } = usePluginTranslations();
  const [started, setStarted] = React.useState<boolean>(false);

  const handleCreateCluster = React.useCallback(() => {
    setStarted(true);
  }, []);

  const [spectrumScaleCluster, spectrumScaleClusterLoaded] =
    useK8sWatchResource<Array<K8sResourceCommon>>({
      limit: 1,
      isList: true,
      groupVersionKind: {
        group: "scale.spectrum.ibm.com",
        version: "v1beta1",
        kind: "Cluster",
      },
    });

  const [fusionAccess, fusionAccessLoaded] = useK8sWatchResource<
    Array<K8sResourceCommon>
  >({
    limit: 1,
    isList: true,
    namespaced: true,
    namespace: "openshift-fusion-access",
    groupVersionKind: {
      group: "fusion.storage.openshift.io",
      version: "v1alpha1",
      kind: "FusionAccess",
    },
  });

  const section = React.useMemo(() => {
    let element: React.ReactElement | null = null;
    switch (true) {
      case !spectrumScaleClusterLoaded:
        element = (
          <LoadingStateSection
            titleText={t("Detecting CNSA clusters")}
            bodyText={t(
              "You will be able to continue after the resources are detected."
            )}
          />
        );
        break;
      case !fusionAccessLoaded || fusionAccess.length === 0:
        element = (
          <LoadingStateSection
            icon={<EmptyStateIcon icon={SearchIcon} />}
            titleText={t("No FusionAccess instance created yet")}
            bodyText={t("You need to create a FusionAccess to continue.")}
          />
        );
        break;
      case spectrumScaleCluster.length === 0 && !started:
        element = <EmptyStateSection onCreateCluster={handleCreateCluster} />;
        break;
      default:
        element = <NodesSelectionSection />;
        break;
    }

    return element;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    started,
    fusionAccess,
    fusionAccessLoaded,
    spectrumScaleCluster,
    spectrumScaleClusterLoaded,
  ]);

  return (
    <PageContextProvider
      documentTitle={t("Fusion Access for SAN")}
      pageTitle={t("Fusion Access for SAN")}
      pageDescription={" "} // TODO(jkilzi): Add page description
      pageActions={[
        <Button key="download-logs-button" variant="link">
          <DownloadIcon /> {t("Download logs")}
        </Button>,
      ]}
    >
      {section}
    </PageContextProvider>
  );
};

FusionAccessPage.displayName = "FusionAccessPage";
export default FusionAccessPage;
