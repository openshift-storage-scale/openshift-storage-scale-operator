import { useCallback } from "react";
import { k8sPatch, useK8sModel } from "@openshift-console/dynamic-plugin-sdk";
import { getLabels, hasLabel } from "@/selectors/console/K8sResourceCommon";
import { STORAGE_ROLE_LABEL } from "../constants";
import { usePluginTranslations } from "@/hooks/usePluginTranslations";
import { useGlobalStateContext } from "../contexts/global-state/GlobalStateContext";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import type { NodeSelectionActions } from "./useNodeSelectionState";

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
  const [, dispatch] = useGlobalStateContext();
  const { t } = usePluginTranslations();
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
            dismissable: false,
          },
        });
      }
    },
    // Safe to ignore: 't', 'dispatch', 'nodeModel' and 'nodeSelectionActions'
    [node, isSelectionPending]
  );
};
