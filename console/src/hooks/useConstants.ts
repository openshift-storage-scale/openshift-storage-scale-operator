import { useMemo } from "react";

export const useConstants = () => useMemo(() => ({
    VALUE_NOT_AVAILABLE: "-",
    STORAGE_ROLE_LABEL: "scale.spectrum.ibm.com/role=storage",
    WORKER_NODE_ROLE_LABEL: "node-role.kubernetes.io/worker=",
    MASTER_NODE_ROLE_LABEL: "node-role.kubernetes.io/master=",
    CPLANE_NODE_ROLE_LABEL: "node-role.kubernetes.io/control-plane=",
}), []);
