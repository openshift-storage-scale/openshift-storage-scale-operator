import {
  useK8sWatchResource,
  type WatchK8sResource,
} from "@openshift-console/dynamic-plugin-sdk";
import {
  WORKER_NODE_ROLE_LABEL,
  MASTER_NODE_ROLE_LABEL,
  CPLANE_NODE_ROLE_LABEL,
} from "../constants";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import type { NodeRole } from "@/selectors/kubernetes/1.30/IoK8sApiCoreV1Node";

const [workerNodeRoleLabelKey, workerNodeRoleLabelValue] =
  WORKER_NODE_ROLE_LABEL.split("=");
const [masterNodeRoleLabelKey, masterNodeRoleLabelValue] =
  MASTER_NODE_ROLE_LABEL.split("=");
const [cplaneNodeRoleLabelKey, cplaneNodeRoleLabelValue] =
  CPLANE_NODE_ROLE_LABEL.split("=");

export const useWatchNode = ({
  role,
  isList,
  limit,
}: {
  role: Exclude<NodeRole, "-">;
} & Pick<WatchK8sResource, "isList" | "limit">) => {
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

  return useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    limit,
    isList,
    groupVersionKind: {
      version: "v1",
      kind: "Node",
    },
    selector: {
      matchLabels,
    },
  });
};
