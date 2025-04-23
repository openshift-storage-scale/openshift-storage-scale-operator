import { Button } from "@patternfly/react-core";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";

interface CreateStorageClusterButtonProps {
  onCreateStorageCluster?: React.MouseEventHandler<HTMLButtonElement>;
  isDisabled?: boolean;
  isHidden?: boolean;
}

export const CreateStorageClusterButton: React.FC<
  CreateStorageClusterButtonProps
> = (props) => {
  const {
    onCreateStorageCluster,
    isDisabled = false,
    isHidden = false,
  } = props;
  const { t } = useFusionAccessTranslations();

  return isHidden ? null : (
    <Button
      variant="primary"
      isDisabled={isDisabled}
      onClick={onCreateStorageCluster}
    >
      {t("Create storage cluster")}
    </Button>
  );
};

CreateStorageClusterButton.displayName = "CreateStorageClusterButton";
