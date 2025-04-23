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
import { useStoreContext } from "@/hooks/useStoreContext";
import { GetStarted } from "@/components/GetStarted";
import { NodesSelection } from "@/components/NodesSelection";
import { TabbedNav } from "@/components/TabbedNav";

export interface UsePageSectionRouterOptions {
  spectrumScaleClustersList: K8sResourceCommon[];
  spectrumScaleClustersListLoaded: boolean;
  fusionAccessesList: K8sResourceCommon[];
  fusionAccessesListLoaded: boolean;
}

export const usePageSectionRouter = ({
  spectrumScaleClustersList,
  spectrumScaleClustersListLoaded,
  fusionAccessesList,
  fusionAccessesListLoaded,
}: UsePageSectionRouterOptions): React.ReactNode => {
  const { t } = useFusionAccessTranslations();
  const [state, dispatch] = useStoreContext();

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
        element = !state.global.userFlowStarted ? (
          <GetStarted
            onGetStarted={() => {
              dispatch({
                type: "updateGlobal",
                payload: { userFlowStarted: true },
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
  }, [
    t,
    dispatch,
    spectrumScaleClustersListLoaded,
    fusionAccessesListLoaded,
    fusionAccessesList.length,
    spectrumScaleClustersList.length,
    state.global.userFlowStarted,
  ]);
};
