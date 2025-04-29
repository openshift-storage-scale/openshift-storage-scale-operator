import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import {
  EmptyState,
  EmptyStateHeader,
  Spinner,
  EmptyStateBody,
} from "@patternfly/react-core";
import { memo } from "react";

export const LoadingState: React.FC = memo(() => {
  const { t } = useFusionAccessTranslations();
  return (
    <EmptyState>
      <EmptyStateHeader
        headingLevel="h4"
        titleText={t("Loading resources...")}
        icon={<Spinner />}
      />
      <EmptyStateBody>
        {t("You will be able to continue once the resources are loaded")}
      </EmptyStateBody>
    </EmptyState>
  );
});
