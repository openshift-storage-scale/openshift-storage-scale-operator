import { t } from "@/hooks/useFusionAccessTranslations";
import { enableMapSet } from "immer";
import type { Actions, State } from "./types";
import type { ImmerReducer } from "use-immer";

enableMapSet(); // Enables Map and Set support in immer
// see: https://immerjs.github.io/immer/map-set

export const reducer: ImmerReducer<State, Actions> = (draft, action) => {
  switch (action.type) {
    case "updateGlobal": {
      const { documentTitle, userFlowStarted } = action.payload;
      draft.global.documentTitle = documentTitle ?? draft.global.documentTitle;
      draft.global.userFlowStarted =
        userFlowStarted ?? draft.global.userFlowStarted;
      break;
    }
    case "addAlert":
      draft.alerts.push(action.payload);
      break;
    case "removeAlert": {
      draft.alerts = draft.alerts.filter(
        ({ key }) => key !== action.payload.key
      );
      break;
    }
    case "clearAlerts":
      draft.alerts = [];
      break;
    case "updatePage":
      draft.page = {
        description: action.payload.description ?? draft.page.description,
        title: action.payload.title ?? draft.page.title,
      };
      break;
    case "updateCtas":
      draft.ctas = {
        createFileSystem:
          action.payload.createFileSystem ?? draft.ctas.createFileSystem,
        createStorageCluster:
          action.payload.createStorageCluster ??
          draft.ctas.createStorageCluster,
        downloadLogs: action.payload.downloadLogs ?? draft.ctas.downloadLogs,
      };
      break;
    default:
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        `Unhandled action type: ${action.type}. Please check the reducer.`
      );
  }
};

export const initialState: State = {
  global: {
    documentTitle: t("Fusion Access for SAN"),
    userFlowStarted: false,
  },
  alerts: [],
  page: {
    title: t("Fusion Access for SAN"),
    description: " ",
  },
  ctas: {
    downloadLogs: { isHidden: false, isDisabled: false },
    createStorageCluster: { isHidden: true, isDisabled: true },
    createFileSystem: { isHidden: true, isDisabled: true },
  },
};
