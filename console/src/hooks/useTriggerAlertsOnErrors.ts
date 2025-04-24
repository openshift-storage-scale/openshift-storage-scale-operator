import { useEffect } from "react";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import { useStoreContext } from "./useStoreContext";
import { getDigest } from "@/utils/crypto/hash";

export const useTriggerAlertsOnErrors = (...errors: (Error | string)[]) => {
  const [state, dispatch] = useStoreContext();
  const { t } = useFusionAccessTranslations();

  useEffect(() => {
    (async () => {
      const sanitizedErrors = errors.filter(Boolean);
      for (const e of sanitizedErrors) {
        const description = e instanceof Error ? e.message : e;
        const descriptionDigest = await getDigest(description);
        const doWeHaveThisAlertAlready = state.alerts.find(
          (alert) => alert.key === descriptionDigest
        );

        if (!doWeHaveThisAlertAlready) {
          dispatch({
            type: "addAlert",
            payload: {
              key: descriptionDigest,
              variant: "danger",
              title: t("An error occurred while watching resources"),
              description,
              isDismissable: true,
            },
          });
        }
      }
    })();
  }, [dispatch, errors, state.alerts, t]);
};
