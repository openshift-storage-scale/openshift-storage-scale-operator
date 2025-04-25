import { DownloadLogsButton } from "@/components/DownloadLogsButton";
import { FileSystemsTabbedNav } from "@/components/FileSystemsTabbedNav";
import { FusionAccessListPage } from "@/components/FusionAccessListPage";
import { StoreProvider } from "@/contexts/store/context";
import { reducer, initialState } from "@/contexts/store/reducer";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";

const FileSystemsHome: React.FC = () => {
  const { t } = useFusionAccessTranslations();
  return (
    <StoreProvider reducer={reducer} initialState={initialState}>
      <FusionAccessListPage
        documentTitle={t("Fusion Access for SAN")}
        title={t("Fusion Access for SAN")}
        actions={<DownloadLogsButton />}
      >
        <FileSystemsTabbedNav />
      </FusionAccessListPage>
    </StoreProvider>
  );
};

FileSystemsHome.displayName = "FileSystemsHome";
export default FileSystemsHome;
