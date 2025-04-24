import {
  useK8sWatchResource,
  type WatchK8sResource,
} from "@openshift-console/dynamic-plugin-sdk";
import {
  WORKER_NODE_ROLE_LABEL,
  MASTER_NODE_ROLE_LABEL,
  CPLANE_NODE_ROLE_LABEL,
} from "@/constants";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import type { NodeRole } from "@/utils/kubernetes/1.30/IoK8sApiCoreV1Node";
import type { UseK8sWatchResourceWithInferedList } from "@/utils/console/UseK8sWatchResource";

const [workerNodeRoleLabelKey, workerNodeRoleLabelValue] =
  WORKER_NODE_ROLE_LABEL.split("=");
const [masterNodeRoleLabelKey, masterNodeRoleLabelValue] =
  MASTER_NODE_ROLE_LABEL.split("=");
const [cplaneNodeRoleLabelKey, cplaneNodeRoleLabelValue] =
  CPLANE_NODE_ROLE_LABEL.split("=");

const makeSelector = (role: Exclude<NodeRole, "-">) => {
  let matchLabels;
  switch (role) {
    case "worker":
      matchLabels = {
        [workerNodeRoleLabelKey]: workerNodeRoleLabelValue,
      };
      break;
    case "master":
      matchLabels = {
        [masterNodeRoleLabelKey]: masterNodeRoleLabelValue,
      };
      break;
    case "control-plane":
      matchLabels = {
        [cplaneNodeRoleLabelKey]: cplaneNodeRoleLabelValue,
      };
      break;
  }

  return { matchLabels };
};

interface Options extends WatchK8sResource {
  role: Exclude<NodeRole, "-">;
}

export const useWatchNode: UseK8sWatchResourceWithInferedList<
  IoK8sApiCoreV1Node,
  Omit<Options, "groupVersionKind" | "selector">
> = (options) =>
  useK8sWatchResource({
    ...options,
    groupVersionKind: {
      version: "v1",
      kind: "Node",
    },
    selector: makeSelector(options.role),
  });
