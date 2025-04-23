import React from "react";
import {
  EmptyState as PFEmptyState,
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
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import { CreateStorageClusterButton } from "@/components/CreateStorageClusterButton";

interface GetStartedProps {
  onGetStarted: React.MouseEventHandler<HTMLButtonElement>;
  learnMoreHref?: string;
}

export const GetStarted: React.FC<GetStartedProps> = (props) => {
  const { onGetStarted, learnMoreHref = "" } = props;
  const { t } = useFusionAccessTranslations();

  return (
    <PFEmptyState>
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
          <CreateStorageClusterButton onCreateStorageCluster={onGetStarted} />
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
    </PFEmptyState>
  );
};

GetStarted.displayName = "GetStarted";
