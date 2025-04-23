import { enableMapSet } from "immer";
import type { ImmerReducer } from "use-immer";
import { t } from "@/hooks/useFusionAccessTranslations";
import type { Actions, State } from "./types";

enableMapSet(); // Enables Map and Set support in immer
// see: https://immerjs.github.io/immer/map-set

export const reducer: ImmerReducer<State, Actions> = (draft, action) => {
  switch (action.type) {
    case "updateGlobal": {
      const { documentTitle, userFlowStarted } = action.payload;
      if (documentTitle) {
        draft.global.documentTitle = documentTitle;
      }
      if (userFlowStarted) {
        draft.global.userFlowStarted = userFlowStarted;
      }
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
    case "updatePage": {
      const { description, title } = action.payload;
      if (description) {
        draft.page.description = description;
      }
      if (title) {
        draft.page.title = title;
      }
      break;
    }
    case "updateCtas": {
      const { createFileSystem, createStorageCluster, downloadLogs } =
        action.payload;
      if (downloadLogs) {
        draft.ctas.downloadLogs.isDisabled = downloadLogs.isDisabled;
        draft.ctas.downloadLogs.isHidden = downloadLogs.isHidden;
      }
      if (createStorageCluster) {
        draft.ctas.downloadLogs.isDisabled = createStorageCluster.isDisabled;
        draft.ctas.createStorageCluster.isHidden =
          createStorageCluster.isHidden;
      }
      if (createFileSystem) {
        draft.ctas.createFileSystem.isDisabled = createFileSystem.isDisabled;
        draft.ctas.createFileSystem.isHidden = createFileSystem.isHidden;
      }
      break;
    }
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
