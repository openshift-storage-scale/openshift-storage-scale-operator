import { useCallback } from "react";
import { Redirect, useHistory } from "react-router";
import { DownloadLogsButton } from "@/components/DownloadLogsButton";
import { FusionAccessListPage } from "@/components/FusionAccessListPage";
import { StorageClusterEmptyState } from "@/components/StorageClusterEmptyState";
import { useFusionAccessListPageBody } from "@/hooks/useFusionAccessListPageBody";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import { useWatchSpectrumScaleCluster } from "@/hooks/useWatchSpectrumScaleCluster";

const FusionAccessHome: React.FC = () => {
  const { t } = useFusionAccessTranslations();
  const [storageClusters, storageClustersLoaded, storageClustersError] =
    useWatchSpectrumScaleCluster({ isList: true, limit: 1 });

  const history = useHistory();
  const handleCreateStorageCluster = useCallback(() => {
    history.push("/fusion-access/storage-cluster/create");
  }, [history]);

  const body = useFusionAccessListPageBody(
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
      {body}
    </FusionAccessListPage>
  ) : (
    <Redirect to={"/fusion-access/file-systems"} />
  );
};

FusionAccessHome.displayName = "FusionAccessHome";
export default FusionAccessHome;
