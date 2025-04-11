import React from "react";
import {
  useK8sWatchResource,
  type K8sResourceCommon,
  // CodeEditor,
} from "@openshift-console/dynamic-plugin-sdk";
import { Button } from "@patternfly/react-core";
import { DownloadIcon } from "@patternfly/react-icons";
import { usePluginTranslations } from "@/hooks/usePluginTranslations";
import { ListPage } from "@/components/ListPage";
import { EmptyStateSection } from "./components/states/EmptyStateSection";
import { LoadingStateSection } from "./components/states/LoadingStateSection";
import { NodesSelectionSection } from "./components/nodes-selection/NodesSelectionSection";

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

  const content = React.useMemo(() => {
    let content: React.ReactElement | null = null;
    switch (true) {
      case !spectrumScaleClusterLoaded:
        // Getting here means the StorageCluster operator is not installed (or no CNSA CRDs are available yet)
        content = <LoadingStateSection />;
        break;
      case spectrumScaleCluster.length === 0 && !started:
        content = <EmptyStateSection onCreateCluster={handleCreateCluster} />;
        break;
      default:
        // content = (
        //   <CodeEditor
        //     minHeight={'100%'}
        //     value={JSON.stringify(spectrumScaleCluster, null, 2)}
        //   />
        // );
        content = <NodesSelectionSection />;
        break;
    }

    return content;
  }, [started, spectrumScaleCluster, spectrumScaleClusterLoaded]);

  return (
    <ListPage
      docTitle={t("Fusion Access for SAN")}
      pageTitle={t("Fusion Access for SAN")}
      pageDescription={t("Page description")}
      pageActions={[
        <Button key="01-btn-download-logs" variant="link">
          <DownloadIcon /> {t("Download logs")}
        </Button>,
      ]}
    >
      {content}
    </ListPage>
  );
};

FusionAccessPage.displayName = "FusionAccessPage";
export default FusionAccessPage;
