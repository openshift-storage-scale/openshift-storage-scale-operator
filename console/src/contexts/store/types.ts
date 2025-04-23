import type { AlertProps } from "@patternfly/react-core/dist/esm/components/Alert/Alert";

export type Action<T extends string, P = undefined> = P extends undefined
  ? { type: T }
  : { type: T; payload: P };

export type Actions =
  // Global actions
  | Action<"updateGlobal", Partial<State["global"]>>
  // Alerts actions
  | Action<"addAlert", State["alerts"][number]>
  | Action<"removeAlert", State["alerts"][number]>
  | Action<"clearAlerts">
  // Page actions
  | Action<"updatePage", Partial<State["page"]>>
  | Action<"updateCtas", Partial<State["ctas"]>>;

export interface State {
  global: GlobalSlice;
  alerts: AlertsSlice;
  page: PageStateSlice;
  ctas: CallToActionsSlice;
}

export interface GlobalSlice {
  documentTitle: string;
  userFlowStarted: boolean;
}

export type AlertsSlice = Array<
  Pick<AlertProps, "key" | "variant" | "title"> & {
    description?: string;
    isDismissable?: boolean;
  }
>;

export interface PageStateSlice {
  title: string;
  description: string;
}

export type CallToActionNames =
  | "createStorageCluster"
  | "createFileSystem"
  | "downloadLogs";

export interface CallToActionState {
  isHidden: boolean;
  isDisabled: boolean;
}

export type CallToActionsSlice = Record<CallToActionNames, CallToActionState>;
