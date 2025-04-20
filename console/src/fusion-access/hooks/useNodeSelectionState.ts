import { useState } from "react";
import { VALUE_NOT_AVAILABLE, STORAGE_ROLE_LABEL } from "../constants";
import type {
  IoK8sApiCoreV1Node,
  IoK8sApimachineryPkgApiResourceQuantity,
} from "@/models/kubernetes/1.30/types";
import {
  getName,
  getUid,
  hasLabel,
} from "@/selectors/console/K8sResourceCommon";
import {
  getRole,
  getCpu,
  getMemory,
  type NodeRole,
} from "@/selectors/kubernetes/1.30/IoK8sApiCoreV1Node";

export interface NodeSelectionState {
  uid: string;
  name: string;
  role: NodeRole;
  cpu: IoK8sApimachineryPkgApiResourceQuantity;
  memory: IoK8sApimachineryPkgApiResourceQuantity;
  isSelected: boolean;
  isSelectionInProgress: boolean;
}

export const useNodeSelectionState = (
  node: IoK8sApiCoreV1Node
): [
  NodeSelectionState,
  React.Dispatch<React.SetStateAction<NodeSelectionState>>,
] => {
  const isSelected = hasLabel(node, STORAGE_ROLE_LABEL);
  const [memoryValue] = getMemory(node);

  const [state, setState] = useState<NodeSelectionState>({
    uid: getUid(node) ?? VALUE_NOT_AVAILABLE,
    name: getName(node) ?? VALUE_NOT_AVAILABLE,
    role: getRole(node) ?? VALUE_NOT_AVAILABLE,
    cpu: getCpu(node) ?? VALUE_NOT_AVAILABLE,
    memory: memoryValue ? memoryValue : VALUE_NOT_AVAILABLE,
    isSelected,
    isSelectionInProgress: false,
  });

  return [state, setState];
};
