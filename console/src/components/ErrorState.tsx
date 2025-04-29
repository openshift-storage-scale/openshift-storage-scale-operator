import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import {
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateActions,
  Button,
} from "@patternfly/react-core";
import { ExclamationCircleIcon } from "@patternfly/react-icons";
import { memo } from "react";

interface ErrorStateProps {
  message: string;
}

export const ErrorState: React.FC<ErrorStateProps> = memo((props) => {
  const { message } = props;
  const { t } = useFusionAccessTranslations();

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={t("Resources could not be loaded")}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={ExclamationCircleIcon} />}
      />
      <EmptyStateBody>
        {t("Please check your configuration")}
        <br />
        {message}
      </EmptyStateBody>
      <EmptyStateActions>
        <Button variant="link" onClick={handleReloadPage}>
          {t("Refresh")}
        </Button>
      </EmptyStateActions>
    </EmptyState>
  );
});

const handleReloadPage = () => {
  window.location.reload();
};
