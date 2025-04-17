import { useMemo } from "react";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import { useConstants } from "@/hooks/useConstants";
import { hasLabel } from "@/selectors/console/K8sResourceCommon";

export const useNodesSelected = (nodes: IoK8sApiCoreV1Node[]) => {
  const { STORAGE_ROLE_LABEL } = useConstants();

  return useMemo(
    () => nodes.filter((n) => hasLabel(n, STORAGE_ROLE_LABEL)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes]
  );
};
