import { MINIMUM_AMOUNT_OF_NODES, MINIMUM_AMOUNT_OF_MEMORY } from "@/constants";
import { useEffect } from "react";
import { useStoreContext } from "./useStoreContext";
import { useFusionAccessTranslations } from "./useFusionAccessTranslations";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";

export const useMinimumNodesMemoryAlert = (
  nodesWithMinimumAmountOfMemory: IoK8sApiCoreV1Node[]
) => {
  const [state, dispatch] = useStoreContext();
  const { t } = useFusionAccessTranslations();

  useEffect(() => {
    const alertDescription = t(
      "At least {{MINIMUM_AMOUNT_OF_NODES}} nodes are required, each with a minimum of {{MINIMUM_AMOUNT_OF_MEMORY}} of RAM.",
      {
        MINIMUM_AMOUNT_OF_NODES,
        MINIMUM_AMOUNT_OF_MEMORY,
      }
    );
    const weHaveAnAlertWithThisDescriptionAlready = state.alerts.find(
      (alert) => alert.description === alertDescription
    );

    if (weHaveAnAlertWithThisDescriptionAlready) {
      return;
    }

    if (nodesWithMinimumAmountOfMemory.length < 3) {
      dispatch({
        type: "addAlert",
        payload: {
          key: Date.now(),
          variant: "warning",
          title: t("Storage cluster requirements"),
          description: alertDescription,
          isDismissable: false,
        },
      });
    } else {
      state.alerts
        .filter((alert) => alert.description === alertDescription)
        .map((alert) => alert.key)
        .forEach((key) => {
          dispatch({ type: "removeAlert", payload: { key } });
        });
    }
  }, [state.alerts, nodesWithMinimumAmountOfMemory.length, t, dispatch]);
};
