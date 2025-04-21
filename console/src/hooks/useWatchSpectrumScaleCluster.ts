import {
  useK8sWatchResource,
  type K8sResourceCommon,
  type WatchK8sResource,
} from "@openshift-console/dynamic-plugin-sdk";

export const useWatchSpectrumScaleCluster = ({
  isList,
  limit,
}: Pick<WatchK8sResource, "isList" | "limit">) => {
  return useK8sWatchResource<Array<K8sResourceCommon>>({
    isList,
    limit,
    groupVersionKind: {
      group: "scale.spectrum.ibm.com",
      version: "v1beta1",
      kind: "Cluster",
    },
  });
};
