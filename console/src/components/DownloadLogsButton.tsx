import { Button } from "@patternfly/react-core";
import { DownloadIcon } from "@patternfly/react-icons";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";

type DownloadLogsButtonProps = {
  onDownloadLogs?: React.MouseEventHandler<HTMLButtonElement>;
  isHidden?: boolean;
};
export const DownloadLogsButton: React.FC<DownloadLogsButtonProps> = (
  props
) => {
  const { onDownloadLogs, isHidden = false } = props;
  const { t } = useFusionAccessTranslations();

  return isHidden ? null : (
    <Button variant="link" onClick={onDownloadLogs}>
      <DownloadIcon /> {t("Download logs")}
    </Button>
  );
};
DownloadLogsButton.displayName = "DownloadLogsButton";
