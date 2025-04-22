import { useCallback } from "react";
import { k8sPatch, useK8sModel } from "@openshift-console/dynamic-plugin-sdk";
import { getLabels, hasLabel } from "@/utils/console/K8sResourceCommon";
import { STORAGE_ROLE_LABEL } from "@/constants";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import type { NodeSelectionActions } from "./useNodeSelectionState";
import { useStoreContext } from "./useStoreContext";

const [storageRoleLabelKey, storageRoleLabelValue] =
  STORAGE_ROLE_LABEL.split("=");

type NodeSelectionHandler = (
  event: React.FormEvent<HTMLInputElement>,
  checked: boolean
) => void;

export type UseNodeSelectionHandler = (options: {
  node: IoK8sApiCoreV1Node;
  isSelectionPending: boolean;
  nodeSelectionActions: NodeSelectionActions;
}) => NodeSelectionHandler;

export const useNodeSelectionHandler: UseNodeSelectionHandler = ({
  node,
  isSelectionPending,
  nodeSelectionActions,
}) => {
  const [, dispatch] = useStoreContext();
  const { t } = useFusionAccessTranslations();
  const [nodeModel, _] = useK8sModel({
    version: "v1",
    kind: "Node",
  });

  return useCallback<NodeSelectionHandler>(
    async (_, checked) => {
      if (isSelectionPending) {
        return;
      }

      const labels = getLabels(node);
      if (!labels) {
        return;
      }

      if (checked) {
        labels[storageRoleLabelKey] = storageRoleLabelValue;
      } else {
        if (storageRoleLabelKey in labels) {
          delete labels[storageRoleLabelKey];
        }
      }

      try {
        nodeSelectionActions.setSelectionPending(checked);
        await k8sPatch({
          data: [
            {
              op: "replace",
              path: "/metadata/labels",
              value: labels,
            },
          ],
          model: nodeModel,
          resource: node,
        });
        nodeSelectionActions.setSelectionSucceeded(checked);
      } catch (e) {
        nodeSelectionActions.setSelectionFailed(
          hasLabel(node, STORAGE_ROLE_LABEL)
        );
        dispatch({
          type: "addAlert",
          payload: {
            key: Date.now(),
            variant: "danger",
            title: t("An error occurred when selecting a node "),
            description: (e as Error).message,
            isDismissable: false,
          },
        });
      }
    },
    [isSelectionPending, node, nodeSelectionActions, nodeModel, dispatch, t]
  );
};
