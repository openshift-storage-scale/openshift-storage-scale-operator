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
import { NodesSelection } from "../views/NodesSelection";
import { usePluginTranslations } from "@/hooks/usePluginTranslations";
import { useGlobalStateContext } from "../contexts/global-state/GlobalStateContext";
import { GetStarted } from "../views/GetStarted";

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
  const { t } = usePluginTranslations();
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
        element = <>"FileSystem screen"</>; // TODO(jkilzi): Implement the FileSystem screen
        break;
    }

    return element;
  }, [
    state,
    fusionAccessesList.length,
    fusionAccessesListLoaded,
    spectrumScaleClustersList.length,
    spectrumScaleClustersListLoaded,
  ]);
};
