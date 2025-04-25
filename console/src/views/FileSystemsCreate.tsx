import { StoreProvider } from "@/contexts/store/context";
import { reducer, initialState } from "@/contexts/store/reducer";
import { DownloadLogsButton } from "@/components/DownloadLogsButton";
import { FusionAccessListPage } from "@/components/FusionAccessListPage";
import { CreateFileSystemButton } from "@/components/CreateFileSystemButton";
import { useCreateFileSystemHandler } from "@/hooks/useCreateFileSystemHandler";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import { useStoreContext } from "@/hooks/useStoreContext";

const FileSystemsCreate: React.FC = () => {
  return (
    <StoreProvider reducer={reducer} initialState={initialState}>
      <ConnectedCreateFileSystems />
    </StoreProvider>
  );
};

FileSystemsCreate.displayName = "FileSystemsCreate";
export default FileSystemsCreate;

const ConnectedCreateFileSystems: React.FC = () => {
  const [store] = useStoreContext();
  const { t } = useFusionAccessTranslations();
  const handleCreateFileSystem = useCreateFileSystemHandler();

  return (
    <FusionAccessListPage
      documentTitle={t("Fusion Access for SAN")}
      title={t("Fusion Access for SAN")}
      description={t(
        "Create a file system to represent your required storage (based on the selected nodes’ storage)."
      )}
      actions={[
        <DownloadLogsButton key="download-logs" />,
        <CreateFileSystemButton
          key="create-filesystem"
          isDisabled={store.ctas.createFileSystem.isDisabled}
          isLoading={store.ctas.createFileSystem.isLoading}
          onCreateFileSystem={handleCreateFileSystem}
        />,
      ]}
      alerts={store.alerts}
    >
      foobar
    </FusionAccessListPage>
  );
};
ConnectedCreateFileSystems.displayName = "ConnectedCreateFileSystems";
