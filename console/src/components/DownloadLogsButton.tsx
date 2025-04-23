import { Button } from "@patternfly/react-core";
import { DownloadIcon } from "@patternfly/react-icons";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";

interface DownloadLogsButtonProps {
  onDownloadLogs?: React.MouseEventHandler<HTMLButtonElement>;
  isDisabled?: boolean;
  isHidden?: boolean;
}

export const DownloadLogsButton: React.FC<DownloadLogsButtonProps> = (
  props
) => {
  const { onDownloadLogs, isDisabled = false, isHidden = false } = props;
  const { t } = useFusionAccessTranslations();

  return isHidden ? null : (
    <Button variant="link" isDisabled={isDisabled} onClick={onDownloadLogs}>
      <DownloadIcon /> {t("Download logs")}
    </Button>
  );
};
DownloadLogsButton.displayName = "DownloadLogsButton";
