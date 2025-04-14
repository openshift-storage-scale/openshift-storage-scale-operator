import React from "react";
import {
  EmptyState,
  EmptyStateBody,
  Button,
  EmptyStateFooter,
  EmptyStateActions,
  EmptyStateHeader,
  EmptyStateIcon,
} from "@patternfly/react-core";
import {
  StorageDomainIcon,
  ExternalLinkAltIcon,
} from "@patternfly/react-icons";
import { usePluginTranslations } from "@/hooks/usePluginTranslations";

type EmptyStateSectionProps = {
  onCreateCluster: React.MouseEventHandler<HTMLButtonElement>;
  learnMoreHref?: string;
};

export const EmptyStateSection: React.FC<EmptyStateSectionProps> = (props) => {
  const { onCreateCluster, learnMoreHref = "" } = props;
  const { t } = usePluginTranslations();

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={t("No storage cluster")}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={StorageDomainIcon} />}
      />
      <EmptyStateBody>
        {t(
          "You need to create a storage cluster before you'll be able to create file systems."
        )}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button onClick={onCreateCluster} variant="primary">
            {t("Create storage cluster")}
          </Button>
        </EmptyStateActions>
        <EmptyStateActions>
          <Button
            component="a"
            variant="link"
            target="_blank"
            rel="noopener noreferrer"
            href={learnMoreHref}
          >
            {t("Learn more about Fusion Access for SAN storage clusters")}{" "}
            <ExternalLinkAltIcon />
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

EmptyStateSection.displayName = "EmptyStateSection";
