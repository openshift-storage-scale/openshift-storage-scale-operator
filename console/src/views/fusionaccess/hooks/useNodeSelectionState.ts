import { useCallback, useMemo } from "react";
import { k8sPatch } from "@openshift-console/dynamic-plugin-sdk";
import { useConstants } from "@/hooks/useConstants";
import { useLabelKeyValue } from "@/hooks/useLabelKeyValue";
import { NodeModel } from "@/models/console/NodeModel";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import {
  getLabels,
  getName,
  getUid,
  hasLabel,
} from "@/selectors/console/K8sResourceCommon";
import {
  getRole,
  getCpu,
  getMemory,
} from "@/selectors/kubernetes/1.30/IoK8sApiCoreV1Node";

export const useNodeSelectionState = (node: IoK8sApiCoreV1Node) => {
  const { STORAGE_ROLE_LABEL, VALUE_NOT_AVAILABLE } = useConstants();
  const [storageRoleLabelKey, storageRoleLabelValue] =
    useLabelKeyValue(STORAGE_ROLE_LABEL);
  const handleNodeSelectionChange = useCallback<
    (event: React.FormEvent<HTMLInputElement>, checked: boolean) => void
  >(
    (_, checked) => {
      const labels = getLabels(node);
      if (!labels) {
        return;
      }

      if (!checked) {
        if (storageRoleLabelKey in labels) {
          delete labels[storageRoleLabelKey];
        }
      } else {
        labels[storageRoleLabelKey] = storageRoleLabelValue;
      }

      k8sPatch({
        data: [
          {
            op: "replace",
            path: "/metadata/labels",
            value: labels,
          },
        ],
        model: NodeModel,
        resource: node,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [node]
  );

  return useMemo(
    () => ({
      uid: getUid(node) ?? VALUE_NOT_AVAILABLE,
      name: getName(node) ?? VALUE_NOT_AVAILABLE,
      role: getRole(node) ?? VALUE_NOT_AVAILABLE,
      cpu: getCpu(node) ?? VALUE_NOT_AVAILABLE,
      memory: getMemory(node) ?? VALUE_NOT_AVAILABLE,
      isSelected: hasLabel(node, STORAGE_ROLE_LABEL),
      handleNodeSelectionChange,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [node, handleNodeSelectionChange]
  );
};
