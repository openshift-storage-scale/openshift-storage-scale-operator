import type { K8sResourceCommon } from "@openshift-console/dynamic-plugin-sdk";

export const getName = <T extends K8sResourceCommon>(obj: T) =>
  obj.metadata?.name;
export const getUid = <T extends K8sResourceCommon>(obj: T) =>
  obj.metadata?.uid;
export const getLabels = <T extends K8sResourceCommon>(obj: T) =>
  obj.metadata?.labels ?? {};
export const hasLabel = <T extends K8sResourceCommon>(
  obj: T,
  label: string
): boolean => {
  let result: boolean = false;
  const [k, v] = label.split("=");
  const labels = getLabels(obj);

  if (labels) {
    result = labels[k] === v;
  }

  return result;
};
