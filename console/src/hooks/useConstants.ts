import { useRef } from "react";

// Use these outside React components
export const VALUE_NOT_AVAILABLE = "-";
export const STORAGE_ROLE_LABEL = "scale.spectrum.ibm.com/role=storage";
export const WORKER_NODE_ROLE_LABEL = "node-role.kubernetes.io/worker=";
export const MASTER_NODE_ROLE_LABEL = "node-role.kubernetes.io/master=";
export const CPLANE_NODE_ROLE_LABEL = "node-role.kubernetes.io/control-plane=";

export const useConstants = () =>
  useRef({
    VALUE_NOT_AVAILABLE,
    STORAGE_ROLE_LABEL,
    WORKER_NODE_ROLE_LABEL,
    MASTER_NODE_ROLE_LABEL,
    CPLANE_NODE_ROLE_LABEL,
  } as const).current;
