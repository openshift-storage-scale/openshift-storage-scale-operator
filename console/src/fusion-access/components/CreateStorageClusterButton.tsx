import { Button } from "@patternfly/react-core";
import { usePluginTranslations } from "@/hooks/usePluginTranslations";

type CreateStorageClusterButtonProps = {
  onCreateStorageCluster?: React.MouseEventHandler<HTMLButtonElement>;
  isDisabled?: boolean;
};

export const CreateStorageClusterButton: React.FC<
  CreateStorageClusterButtonProps
> = (props) => {
  const { onCreateStorageCluster, isDisabled = false } = props;
  const { t } = usePluginTranslations();

  return (
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
