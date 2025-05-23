import {
  useK8sWatchResource,
  type WatchK8sResource,
} from "@openshift-console/dynamic-plugin-sdk";
import type { UseK8sWatchResourceWithInferedList } from "@/utils/console/UseK8sWatchResource";
import type { Cluster } from "@/models/ibm-spectrum-scale/Cluster";

export const useWatchSpectrumScaleCluster: UseK8sWatchResourceWithInferedList<
  Cluster,
  Omit<WatchK8sResource, "groupVersionKind">
> = (options) => {
  return useK8sWatchResource({
    ...options,
    groupVersionKind: {
      group: "scale.spectrum.ibm.com",
      version: "v1beta1",
      kind: "Cluster",
    },
  });
};
