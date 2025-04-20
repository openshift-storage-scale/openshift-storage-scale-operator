import {
  useK8sWatchResource,
  type K8sResourceCommon,
  type WatchK8sResource,
} from "@openshift-console/dynamic-plugin-sdk";

export const useWatchFusionAccess = ({
  isList,
  limit,
}: Pick<WatchK8sResource, "isList" | "limit">) => {
  return useK8sWatchResource<Array<K8sResourceCommon>>({
    limit,
    isList,
    namespaced: true,
    namespace: "openshift-fusion-access",
    groupVersionKind: {
      group: "fusion.storage.openshift.io",
      version: "v1alpha1",
      kind: "FusionAccess",
    },
  });
};
