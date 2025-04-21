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

export type NodeSelectionState = {
  uid: string;
  name: string;
  role: NodeRole;
  cpu: IoK8sApimachineryPkgApiResourceQuantity;
  memory: IoK8sApimachineryPkgApiResourceQuantity;
  isSelected: boolean;
  isSelectionPending: boolean;
};

export type NodeSelectionActions = {
  setSelectionPending: (checked: boolean) => void;
  setSelectionSucceeded: (checked: boolean) => void;
  setSelectionFailed: (hasStorageRoleLabel: boolean) => void;
};

export const useNodeSelectionState = (
  node: IoK8sApiCoreV1Node
): [NodeSelectionState, NodeSelectionActions] => {
  const isSelected = hasLabel(node, STORAGE_ROLE_LABEL);
  const [memoryValue] = getMemory(node);

  const [state, setState] = useState<NodeSelectionState>({
    uid: getUid(node) ?? VALUE_NOT_AVAILABLE,
    name: getName(node) ?? VALUE_NOT_AVAILABLE,
    role: getRole(node) ?? VALUE_NOT_AVAILABLE,
    cpu: getCpu(node) ?? VALUE_NOT_AVAILABLE,
    memory: memoryValue ? memoryValue : VALUE_NOT_AVAILABLE,
    isSelected,
    isSelectionPending: false,
  });

  const actions = {
    setSelectionPending: (checked: boolean) => {
      setState((s) => ({
        ...s,
        isSelectionPending: true,
        isSelected: checked,
      }));
    },
    setSelectionSucceeded: (checked: boolean) => {
      setState((s) => ({
        ...s,
        isSelectionPending: false,
        isSelected: checked,
      }));
    },
    setSelectionFailed: (hasStorageRoleLabel: boolean) => {
      setState((s) => ({
        ...s,
        isSelectionPending: false,
        isSelected: hasStorageRoleLabel,
      }));
    },
  };

  return [state, actions];
};
