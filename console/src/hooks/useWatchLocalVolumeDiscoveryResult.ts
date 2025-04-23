import type { LocalVolumeDiscoveryResult } from "@/models/fusion-access/LocalVolumeDiscoveryResult";
import type { UseK8sWatchResourceWithInferedList } from "@/utils/console/UseK8sWatchResource";
import {
  useK8sWatchResource,
  type WatchK8sResource,
} from "@openshift-console/dynamic-plugin-sdk";

export const useWatchLocalVolumeDiscoveryResult: UseK8sWatchResourceWithInferedList<
  LocalVolumeDiscoveryResult,
  Omit<WatchK8sResource, "groupVersionKind">
> = (options) => {
  return useK8sWatchResource({
    ...options,
    groupVersionKind: {
      group: "fusion.storage.openshift.io",
      version: "v1alpha1",
      kind: "LocalVolumeDiscoveryResult",
    },
  });
};
