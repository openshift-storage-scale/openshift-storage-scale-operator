import type { AlertProps } from "@patternfly/react-core/dist/esm/components/Alert/Alert";

export type Loadable<D = unknown, E = Error> = D & {
  loading: boolean;
  error: E;
};

export type Action<T extends string, P = undefined> = P extends undefined
  ? { type: T }
  : { type: T; payload: P };

export type Actions =
  | Action<"updateUserFlow", State["userFlow"]>
  // Alerts
  | Action<"addAlert", State["alerts"][number]>
  | Action<"removeAlert", State["alerts"][number]>
  | Action<"clearAlerts">
  // Page actions
  | Action<"updatePageDescription", PageStateSlice["description"]>
  | Action<"updateCreateStorageClusterCta", PageCallToActionsState>
  | Action<"updateCreateFileSystemCta", PageCallToActionsState>;

export type State = {
  userFlow: { isStarted: boolean };
  alerts: Array<
    Pick<AlertProps, "key" | "variant" | "title"> & {
      description?: string;
      isDismissable?: boolean;
    }
  >;
  page: PageStateSlice;
};

export type PageCallToActionsState = {
  isHidden: boolean;
  isDisabled: boolean;
};

export type PageStateSlice = {
  documentTitle: string;
  title: string;
  description: string;
  ctas: {
    downloadLogs: PageCallToActionsState;
    createStorageCluster: PageCallToActionsState;
    createFileSystem: PageCallToActionsState;
  };
};
