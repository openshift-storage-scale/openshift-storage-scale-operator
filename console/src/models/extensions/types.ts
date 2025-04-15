import type { K8sModel } from "@openshift-console/dynamic-plugin-sdk";

export type K8sResourceRef<T extends K8sModel = K8sModel> =
  | `${T["apiVersion"]}~${T["kind"]}`
  | `${T["apiGroup"]}~${T["apiVersion"]}~${T["kind"]}`;
