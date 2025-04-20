import { useCallback } from "react";
import { k8sPatch, useK8sModel } from "@openshift-console/dynamic-plugin-sdk";
import { getLabels, hasLabel } from "@/selectors/console/K8sResourceCommon";
import { STORAGE_ROLE_LABEL } from "../constants";
import { usePluginTranslations } from "@/hooks/usePluginTranslations";
import { useGlobalStateContext } from "../contexts/global-state/GlobalStateContext";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import type { NodeSelectionState } from "./useNodeSelectionState";

const [storageRoleLabelKey, storageRoleLabelValue] =
  STORAGE_ROLE_LABEL.split("=");

type NodeSelectionHandler = (
  event: React.FormEvent<HTMLInputElement>,
  checked: boolean
) => void;

export type UseNodeSelectionHandler = (options: {
  node: IoK8sApiCoreV1Node;
  isSelectionInProgress: boolean;
  setNodeSelectionState: React.Dispatch<
    React.SetStateAction<NodeSelectionState>
  >;
}) => NodeSelectionHandler;

export const useNodeSelectionHandler: UseNodeSelectionHandler = ({
  node,
  isSelectionInProgress,
  setNodeSelectionState,
}) => {
  const [, dispatch] = useGlobalStateContext();
  const { t } = usePluginTranslations();
  const [nodeModel, _] = useK8sModel({
    version: "v1",
    kind: "Node",
  });

  return useCallback<NodeSelectionHandler>(
    async (_, checked) => {
      if (isSelectionInProgress) {
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
        setNodeSelectionState((s) => ({
          ...s,
          isSelectionInProgress: true,
          isSelected: checked,
        }));

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

        setNodeSelectionState((s) => ({
          ...s,
          isSelectionInProgress: false,
          selectionError: null,
          isSelected: checked,
        }));
      } catch (e) {
        setNodeSelectionState((s) => ({
          ...s,
          isSelectionInProgress: false,
          isSelected: hasLabel(node, STORAGE_ROLE_LABEL),
        }));
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
    // Safe to ignore: 't', 'dispatch', 'nodeModel' and 'setNodeSelectionState'
    [node, isSelectionInProgress]
  );
};
