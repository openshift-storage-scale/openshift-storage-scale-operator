import { K8sModelDecorator } from "../console/K8sModelDecorator";

export const LocalVolumeDiscoveryResultModel = new K8sModelDecorator({
  abbr: "LVDR",
  apiGroup: "fusion.storage.openshift.io",
  apiVersion: "v1alpha1",
  kind: "LocalVolumeDiscoveryResult",
  label: "LocalVolumeDiscoveryResult",
  labelPlural: "LocalVolumeDiscoveryResults",
  plural: "localvolumediscoveryresults",
});
