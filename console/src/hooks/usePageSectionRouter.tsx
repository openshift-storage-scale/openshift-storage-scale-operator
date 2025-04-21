import { useMemo } from "react";
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  Spinner,
} from "@patternfly/react-core";
import type { K8sResourceCommon } from "@openshift-console/dynamic-plugin-sdk";
import { SearchIcon } from "@patternfly/react-icons";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import { useGlobalStateContext } from "@/hooks/useGlobalStateContext";
import { GetStarted } from "@/components/GetStarted";
import { NodesSelection } from "@/components/NodesSelection";
import { TabbedNav } from "@/components/TabbedNav";

export type UsePageSectionRouterOptions = {
  spectrumScaleClustersList: K8sResourceCommon[];
  spectrumScaleClustersListLoaded: boolean;
  fusionAccessesList: K8sResourceCommon[];
  fusionAccessesListLoaded: boolean;
};

export const usePageSectionRouter = ({
  spectrumScaleClustersList,
  spectrumScaleClustersListLoaded,
  fusionAccessesList,
  fusionAccessesListLoaded,
}: UsePageSectionRouterOptions) => {
  const { t } = useFusionAccessTranslations();
  const [state, dispatch] = useGlobalStateContext();

  return useMemo(() => {
    let element: React.ReactNode = null;
    switch (true) {
      case !spectrumScaleClustersListLoaded:
        element = (
          <EmptyState>
            <EmptyStateHeader
              headingLevel="h4"
              titleText={t("Loading CNSA resources")}
              icon={<Spinner />}
            />
            <EmptyStateBody>
              {t("You will be able to continue once the resources are loaded.")}
            </EmptyStateBody>
          </EmptyState>
        );
        break;
      case !fusionAccessesListLoaded:
        element = (
          <EmptyState>
            <EmptyStateHeader
              headingLevel="h4"
              titleText={t("Loading the FusionAccess instance")}
              icon={<Spinner />}
            />
            <EmptyStateBody>
              {t("You will be able to continue once the instace is loaded.")}
            </EmptyStateBody>
          </EmptyState>
        );
        break;
      case fusionAccessesList.length === 0:
        element = (
          <EmptyState>
            <EmptyStateHeader
              headingLevel="h4"
              titleText={t("No FusionAccess instance")}
              icon={<EmptyStateIcon icon={SearchIcon} />}
            />
            <EmptyStateBody>
              {t("Create a FusionAccess from the operator page to continue.")}
            </EmptyStateBody>
          </EmptyState>
        );
        break;
      case spectrumScaleClustersList.length === 0:
        element = !state.userFlow.isStarted ? (
          <GetStarted
            onGetStarted={() => {
              dispatch({
                type: "updateUserFlow",
                payload: { isStarted: true },
              });
            }}
          />
        ) : (
          <NodesSelection />
        );
        break;
      default:
        element = <TabbedNav />;
        break;
    }

    return element;
    // Safe to ignore: 't' and 'dispatch'
  }, [
    state.userFlow.isStarted,
    fusionAccessesList.length,
    fusionAccessesListLoaded,
    spectrumScaleClustersList.length,
    spectrumScaleClustersListLoaded,
  ]);
};
