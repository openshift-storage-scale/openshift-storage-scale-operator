import { useEffect } from "react";
import { useGlobalStateContext } from "@/hooks/useGlobalStateContext";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";

export const useTriggerAlertsOnErrors = (...errors: Error[]) => {
  const [, dispatch] = useGlobalStateContext();
  const { t } = useFusionAccessTranslations();

  useEffect(
    () => {
      for (const e of errors) {
        if (e) {
          dispatch({
            type: "addAlert",
            payload: {
              key: Date.now(),
              variant: "danger",
              title: t("An error occurred while watching resources "),
              description: e.message,
              isDismissable: true,
            },
          });
        }
      }
    },
    // Safe to ignore: 't' and 'dispatch'
    [errors]
  );
};
