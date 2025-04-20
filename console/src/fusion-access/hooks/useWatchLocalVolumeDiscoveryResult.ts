import type { LocalVolumeDiscoveryResult } from "@/models/fusion-storage/LocalVolumeDiscoveryResult";
import {
  useK8sWatchResource,
  type WatchK8sResource,
} from "@openshift-console/dynamic-plugin-sdk";

export const useWatchLocalVolumeDiscoveryResult = ({
  isList,
  limit,
}: Pick<WatchK8sResource, "isList" | "limit">) => {
  return useK8sWatchResource<LocalVolumeDiscoveryResult[]>({
    isList,
    limit,
    groupVersionKind: {
      group: "fusion.storage.openshift.io",
      version: "v1alpha1",
      kind: "LocalVolumeDiscoveryResult",
    },
  });
};
