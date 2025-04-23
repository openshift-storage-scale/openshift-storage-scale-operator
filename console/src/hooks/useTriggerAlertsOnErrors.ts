import { useEffect } from "react";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import { useStoreContext } from "./useStoreContext";

export const useTriggerAlertsOnErrors = (...errors: (Error|string)[]) => {
  const [,dispatch] = useStoreContext();
  const { t } = useFusionAccessTranslations();

  useEffect(() => {
    for (const e of errors) {
      if (e) {
        dispatch({
          type: "addAlert",
          payload: {
            key: Date.now(),
            variant: "danger",
            title: t("An error occurred while watching resources "),
            description: (e instanceof Error) ? e.message : e,
            isDismissable: true,
          },
        });
      }
    }
  }, [dispatch, errors, t]);
};
