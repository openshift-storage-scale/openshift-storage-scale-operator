import React from "react";
import {
  EmptyState,
  EmptyStateHeader,
  Spinner,
  EmptyStateBody,
  EmptyStateFooter,
} from "@patternfly/react-core";
import { usePluginTranslations } from "@/hooks/usePluginTranslations";

export const LoadingStateSection: React.FC = () => {
  const { t } = usePluginTranslations();

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={t("Waiting for the CNSA resources to become available")}
        headingLevel="h4"
        icon={<Spinner />}
      />
      <EmptyStateBody>
        {t("You will be able to continue after the resources are detected.")}
      </EmptyStateBody>
      <EmptyStateFooter></EmptyStateFooter>
    </EmptyState>
  );
};

LoadingStateSection.displayName = "LoadingStateSection";
