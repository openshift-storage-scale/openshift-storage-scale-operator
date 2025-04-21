import { t } from "@/hooks/useFusionAccessTranslations";
import type { Actions, State } from "./types";

export const reducer: React.Reducer<Readonly<State>, Actions> = (
  lastState,
  action
) => {
  let nextState: State = lastState;

  switch (action.type) {
    case "updateUserFlow":
      nextState = {
        ...lastState,
        userFlow: {
          isStarted: action.payload.isStarted,
        },
      };
      break;
    case "addAlert":
      nextState = {
        ...lastState,
        alerts: lastState.alerts.concat(action.payload),
      };
      break;
    case "removeAlert":
      nextState = {
        ...lastState,
        alerts: lastState.alerts.filter(
          ({ key }) => key !== action.payload.key
        ),
      };
      break;
    case "clearAlerts":
      nextState = {
        ...lastState,
        alerts: [],
      };
      break;
    case "updatePageDescription":
      nextState = {
        ...lastState,
        page: {
          ...lastState.page,
          description: action.payload,
        },
      };
      break;
    case "updateCreateStorageClusterCta":
      nextState = {
        ...lastState,
        page: {
          ...lastState.page,
          ctas: {
            ...lastState.page.ctas,
            createStorageCluster: {
              isDisabled: action.payload.isDisabled,
              isHidden: action.payload.isHidden,
            },
          },
        },
      };
      break;
    case "updateCreateFileSystemCta":
      nextState = {
        ...lastState,
        page: {
          ...lastState.page,
          ctas: {
            ...lastState.page.ctas,
            createFileSystem: {
              isDisabled: action.payload.isDisabled,
              isHidden: action.payload.isHidden,
            },
          },
        },
      };
      break;
    default:
      break;
  }

  return nextState;
};

export const initialState: State = {
  userFlow: { isStarted: false },
  alerts: [],
  page: {
    documentTitle: t("Fusion Access for SAN"),
    title: t("Fusion Access for SAN"),
    description: " ",
    ctas: {
      downloadLogs: { isHidden: false, isDisabled: false },
      createStorageCluster: { isHidden: true, isDisabled: true },
      createFileSystem: { isHidden: true, isDisabled: true },
    },
  },
};
