import { useConstants, VALUE_NOT_AVAILABLE } from "@/hooks/useConstants";

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
import { useState } from "react";

export type NodeSelectionChangeHandler = (
  event: React.FormEvent<HTMLInputElement>,
  checked: boolean
) => void;

export interface NodeSelectionState {
  uid: string;
  name: string;
  role: NodeRole;
  cpu: IoK8sApimachineryPkgApiResourceQuantity;
  memory: IoK8sApimachineryPkgApiResourceQuantity;
  isSelected: boolean;
  selectionError: Error | null;
  isSelectionInProgress: boolean;
}

export const useNodeSelectionState = (
  node: IoK8sApiCoreV1Node
): [
  NodeSelectionState,
  React.Dispatch<React.SetStateAction<NodeSelectionState>>,
] => {
  const { STORAGE_ROLE_LABEL } = useConstants();
  const isSelected = hasLabel(node, STORAGE_ROLE_LABEL);
  const [memoryValue] = getMemory(node);
  const [state, setState] = useState<NodeSelectionState>({
    uid: getUid(node) ?? VALUE_NOT_AVAILABLE,
    name: getName(node) ?? VALUE_NOT_AVAILABLE,
    role: getRole(node) ?? VALUE_NOT_AVAILABLE,
    cpu: getCpu(node) ?? VALUE_NOT_AVAILABLE,
    memory: memoryValue ? memoryValue : VALUE_NOT_AVAILABLE,
    isSelected,
    selectionError: null,
    isSelectionInProgress: false,
  });

  return [state, setState];
};
