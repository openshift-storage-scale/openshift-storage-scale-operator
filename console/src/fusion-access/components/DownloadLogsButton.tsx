import { Button } from "@patternfly/react-core";
import { DownloadIcon } from "@patternfly/react-icons";
import { usePluginTranslations } from "@/hooks/usePluginTranslations";

type DownloadLogsButtonProps = {
  onDownloadLogs?: React.MouseEventHandler<HTMLButtonElement>;
};
export const DownloadLogsButton: React.FC<DownloadLogsButtonProps> = (
  props
) => {
  const { onDownloadLogs } = props;
  const { t } = usePluginTranslations();

  return (
    <Button variant="link" onClick={onDownloadLogs}>
      <DownloadIcon /> {t("Download logs")}
    </Button>
  );
};
DownloadLogsButton.displayName = "DownloadLogsButton";
