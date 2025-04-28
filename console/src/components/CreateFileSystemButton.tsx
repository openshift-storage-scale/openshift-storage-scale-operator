import { Button } from "@patternfly/react-core";
import type { ButtonProps } from "@patternfly/react-core/dist/js/components/Button";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";

interface CreateFileSystemButtonProps
  extends Omit<ButtonProps, "variant" | "onClick"> {
  onCreateFileSystem?: React.MouseEventHandler<HTMLButtonElement>;
  isDisabled?: boolean;
}

export const CreateFileSystemButton: React.FC<CreateFileSystemButtonProps> = (
  props
) => {
  const { onCreateFileSystem, ...buttonProps } = props;
  const { t } = useFusionAccessTranslations();

  return (
    <Button {...buttonProps} variant="primary" onClick={onCreateFileSystem}>
      {t("Create file system")}
    </Button>
  );
};

CreateFileSystemButton.displayName = "CreateFileSystemButton";
