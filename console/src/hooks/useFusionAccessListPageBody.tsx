import { useMemo, useCallback } from "react";
import {
  Spinner,
  EmptyStateIcon,
  EmptyStateBody,
  EmptyStateActions,
  Button,
  EmptyState,
  EmptyStateHeader,
} from "@patternfly/react-core";
import { ExclamationCircleIcon } from "@patternfly/react-icons";
import { useFusionAccessTranslations } from "./useFusionAccessTranslations";

export const useFusionAccessListPageBody = (
  SuccessComp: React.ReactNode,
  loaded: boolean,
  error: Error | string
): React.ReactNode => {
  return useMemo(() => {
    switch (true) {
      case !loaded:
        return <Loading />;
      case Boolean(error): {
        return <LoadingFailure />;
      }
      default:
        return SuccessComp;
    }
  }, [SuccessComp, error, loaded]);
};

const Loading: React.FC = () => {
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
};

const LoadingFailure: React.FC = () => {
  const { t } = useFusionAccessTranslations();
  const handleReloadPage = useCallback(() => {
    window.location.reload();
  }, []);

  // TODO(jkilzi): Do something useful with the error message
  // const msg = error instanceof Error ? error.message : error;
  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={t("Resources could not be loaded")}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={ExclamationCircleIcon} />}
      />
      <EmptyStateBody>{t("Please check your configuration")}</EmptyStateBody>
      <EmptyStateActions>
        <Button variant="link" onClick={handleReloadPage}>
          {t("Refresh")}
        </Button>
      </EmptyStateActions>
    </EmptyState>
  );
};
