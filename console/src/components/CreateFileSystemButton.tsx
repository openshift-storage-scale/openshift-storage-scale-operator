import { Button } from "@patternfly/react-core";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";

interface CreateFileSystemButtonProps {
  onCreateFileSystem?: React.MouseEventHandler<HTMLButtonElement>;
  isDisabled?: boolean;
}

export const CreateFileSystemButton: React.FC<CreateFileSystemButtonProps> = (
  props
) => {
  const { onCreateFileSystem, isDisabled = false } = props;
  const { t } = useFusionAccessTranslations();

  return (
    <Button
      variant="primary"
      isDisabled={isDisabled}
      onClick={onCreateFileSystem}
    >
      {t("Create file system")}
    </Button>
  );
};

CreateFileSystemButton.displayName = "CreateFileSystemButton";
