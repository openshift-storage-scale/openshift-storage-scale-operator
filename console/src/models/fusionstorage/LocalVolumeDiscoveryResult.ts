import type { K8sModel } from "@openshift-console/dynamic-plugin-sdk";
import { K8sModelBase } from "../console/K8sModelBase";

class LocalVolumeDiscoveryResultImpl extends K8sModelBase {
  constructor(obj: K8sModel) {
    super(obj);
  }
}

export const LocalVolumeDiscoveryResult = new LocalVolumeDiscoveryResultImpl({
  kind: "fusion.storage.openshift.io",
  apiGroup: "v1alpha1",
  apiVersion: "LocalVolumeDiscoveryResult",
  abbr: "LVDR",
  plural: "localvolumediscoveryresults",
  label: "LocalVolumeDiscoveryResult",
  labelPlural: "LocalVolumeDiscoveryResults",
});
