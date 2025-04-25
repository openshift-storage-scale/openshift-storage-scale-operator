import {
  MIN_AMOUNT_OF_NODES_MSG_DIGEST,
  MINIMUM_AMOUNT_OF_NODES,
} from "@/constants";
import { useEffect } from "react";
import { useStoreContext } from "./useStoreContext";
import { useFusionAccessTranslations } from "./useFusionAccessTranslations";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import { useSelectedNodes } from "./useSelectedNodes";

export const useValidateStorageClusterMinimumRequirements = (
  nodesWithMinimumAmountOfMemory: IoK8sApiCoreV1Node[],
  isLoading: boolean
) => {
  const [, dispatch] = useStoreContext();
  const { t } = useFusionAccessTranslations();
  const selectedNodes = useSelectedNodes(nodesWithMinimumAmountOfMemory);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const description = t(
      "At least {{MINIMUM_AMOUNT_OF_NODES}} nodes are required.",
      {
        MINIMUM_AMOUNT_OF_NODES,
      }
    );

    if (selectedNodes.length < 3) {
      dispatch({
        type: "updateCtas",
        payload: { createStorageCluster: { isDisabled: true } },
      });
      dispatch({
        type: "addAlert",
        payload: {
          key: MIN_AMOUNT_OF_NODES_MSG_DIGEST,
          variant: "warning",
          title: t("Storage cluster requirements"),
          description,
          isDismissable: false,
        },
      });
    } else {
      dispatch({
        type: "updateCtas",
        payload: { createStorageCluster: { isDisabled: false } },
      });
      dispatch({
        type: "removeAlert",
        payload: { key: MIN_AMOUNT_OF_NODES_MSG_DIGEST },
      });
    }
  }, [dispatch, isLoading, selectedNodes, t]);
};
