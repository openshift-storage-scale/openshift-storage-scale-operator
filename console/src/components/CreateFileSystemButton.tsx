import { Button } from "@patternfly/react-core";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";

type CreateFileSystemButtonProps = {
  onCreateFileSystem?: React.MouseEventHandler<HTMLButtonElement>;
  isDisabled?: boolean;
  isHidden?: boolean;
};

export const CreateFileSystemButton: React.FC<CreateFileSystemButtonProps> = (
  props
) => {
  const { onCreateFileSystem, isDisabled = false, isHidden = false } = props;
  const { t } = useFusionAccessTranslations();

  return isHidden ? null : (
    <Button
      variant="primary"
      isDisabled={isDisabled}
      hidden={isHidden}
      onClick={onCreateFileSystem}
    >
      {t("Create file system")}
    </Button>
  );
};

CreateFileSystemButton.displayName = "CreateFileSystemButton";
