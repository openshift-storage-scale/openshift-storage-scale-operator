import { MINIMUM_AMOUNT_OF_NODES, MINIMUM_AMOUNT_OF_MEMORY } from "@/constants";
import { useEffect } from "react";
import { useStoreContext } from "./useStoreContext";
import { useFusionAccessTranslations } from "./useFusionAccessTranslations";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import { getDigest } from "@/utils/crypto/hash";

export const useMinimumNodesMemoryAlert = (
  nodesWithMinimumAmountOfMemory: IoK8sApiCoreV1Node[]
) => {
  const [state, dispatch] = useStoreContext();
  const { t } = useFusionAccessTranslations();

  useEffect(() => {
    (async () => {
      const description = t(
        "At least {{MINIMUM_AMOUNT_OF_NODES}} nodes are required, each with a minimum of {{MINIMUM_AMOUNT_OF_MEMORY}} of RAM.",
        {
          MINIMUM_AMOUNT_OF_NODES,
          MINIMUM_AMOUNT_OF_MEMORY,
        }
      );
      const descriptionDigest = await getDigest(description);
      const weHaveThisAlertAlready = state.alerts.find(
        (alert) => alert.key === descriptionDigest
      );

      if (weHaveThisAlertAlready) {
        return;
      }

      if (nodesWithMinimumAmountOfMemory.length < 3) {
        dispatch({
          type: "addAlert",
          payload: {
            key: descriptionDigest,
            variant: "warning",
            title: t("Storage cluster requirements"),
            description,
            isDismissable: false,
          },
        });
      } else {
        state.alerts
          .filter((alert) => alert.key === descriptionDigest)
          .map((alert) => alert.key)
          .forEach((key) => {
            dispatch({ type: "removeAlert", payload: { key } });
          });
      }
    })();
  }, [state.alerts, nodesWithMinimumAmountOfMemory.length, t, dispatch]);
};
