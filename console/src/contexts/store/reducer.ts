import { enableMapSet } from "immer";
import type { ImmerReducer } from "use-immer";
import { t } from "@/hooks/useFusionAccessTranslations";
import type { Actions, State } from "./types";

enableMapSet(); // Enables Map and Set support in immer
// see: https://immerjs.github.io/immer/map-set

export const reducer: ImmerReducer<State, Actions> = (draft, action) => {
  switch (action.type) {
    case "updateGlobal":
      {
        draft.global = { ...draft.global, ...action.payload };
      }
      break;
    case "addAlert":
      {
        const alertAlreadyExists = draft.alerts.find(
          (alert) => alert.key === action.payload.key
        );
        if (!alertAlreadyExists) {
          draft.alerts.push(action.payload);
        }
      }
      break;
    case "removeAlert":
      {
        draft.alerts = draft.alerts.filter(
          ({ key }) => key !== action.payload.key
        );
      }
      break;
    case "clearAlerts":
      draft.alerts = [];
      break;
    case "updateCtas":
      {
        const { createFileSystem, createStorageCluster, downloadLogs } =
          action.payload;
        draft.ctas = {
          createFileSystem: {
            ...draft.ctas.createFileSystem,
            ...createFileSystem,
          },
          createStorageCluster: {
            ...draft.ctas.createStorageCluster,
            ...createStorageCluster,
          },
          downloadLogs: { ...draft.ctas.downloadLogs, ...downloadLogs },
        };
      }
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
  ctas: {
    downloadLogs: { isDisabled: false, isLoading: false },
    createStorageCluster: { isDisabled: true, isLoading: false },
    createFileSystem: { isDisabled: true, isLoading: false },
  },
};
