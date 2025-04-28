import { memo, useCallback, useMemo } from "react";
import { Redirect, useHistory } from "react-router";
import { DownloadLogsButton } from "@/components/DownloadLogsButton";
import { FusionAccessListPage } from "@/components/FusionAccessListPage";
import { StorageClusterEmptyState } from "@/components/StorageClusterEmptyState";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import { useWatchSpectrumScaleCluster } from "@/hooks/useWatchSpectrumScaleCluster";
import {
  Button,
  EmptyState,
  EmptyStateHeader,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateActions,
  Spinner,
} from "@patternfly/react-core";
import { ExclamationCircleIcon } from "@patternfly/react-icons";

const FusionAccessHome: React.FC = () => {
  const { t } = useFusionAccessTranslations();
  const [storageClusters, storageClustersLoaded, storageClustersError] =
    useWatchSpectrumScaleCluster({ isList: true, limit: 1 });

  const history = useHistory();
  const handleCreateStorageCluster = useCallback(() => {
    history.push("/fusion-access/storage-cluster/create");
  }, [history]);

  const node = useReactNodeWithPredefinedFallback(
    <StorageClusterEmptyState
      onCreateStorageCluster={handleCreateStorageCluster}
    />,
    storageClustersLoaded,
    storageClustersError
  );

  return storageClusters.length === 0 ? (
    <FusionAccessListPage
      documentTitle={t("Fusion Access for SAN")}
      title={t("Fusion Access for SAN")}
      actions={<DownloadLogsButton />}
    >
      {node}
    </FusionAccessListPage>
  ) : (
    <Redirect to={"/fusion-access/file-systems"} />
  );
};

FusionAccessHome.displayName = "FusionAccessHome";
export default FusionAccessHome;

const useReactNodeWithPredefinedFallback = (
  SuccessNode: React.ReactNode,
  loaded: boolean,
  error: Error | string
): React.ReactNode => {
  return useMemo(() => {
    switch (true) {
      case !loaded:
        return <LoadingComponent />;
      case Boolean(error): {
        return <ErrorComponent />;
      }
      default:
        return SuccessNode;
    }
  }, [SuccessNode, error, loaded]);
};

const LoadingComponent: React.FC = memo(() => {
  const { t } = useFusionAccessTranslations();
  return (
    <EmptyState>
      <EmptyStateHeader
        headingLevel="h4"
        titleText={t("Loading resources...")}
        icon={<Spinner />}
      />
      <EmptyStateBody>
        {t("You will be able to continue once the resources are loaded")}
      </EmptyStateBody>
    </EmptyState>
  );
});

const ErrorComponent: React.FC = memo(() => {
  const { t } = useFusionAccessTranslations();
  const handleReloadPage = useCallback(() => {
    window.location.reload();
  }, []);

  // TODO(jkilzi): Do something useful with the error message
  // const msg = error instanceof Error ? error.message : error;
  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={t("Resources could not be loaded")}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={ExclamationCircleIcon} />}
      />
      <EmptyStateBody>{t("Please check your configuration")}</EmptyStateBody>
      <EmptyStateActions>
        <Button variant="link" onClick={handleReloadPage}>
          {t("Refresh")}
        </Button>
      </EmptyStateActions>
    </EmptyState>
  );
});
