import { useMemo } from "react";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import { hasLabel } from "@/selectors/console/K8sResourceCommon";
import { STORAGE_ROLE_LABEL } from "../constants";

export const useSelectedNodes = (nodes: IoK8sApiCoreV1Node[]) => {
  return useMemo(
    () => nodes.filter((n) => hasLabel(n, STORAGE_ROLE_LABEL)),
    [nodes]
  );
};
