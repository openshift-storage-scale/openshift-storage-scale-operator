import { useEffect } from "react";
import { useGlobalStateContext } from "../contexts/global-state/GlobalStateContext";
import { usePluginTranslations } from "@/hooks/usePluginTranslations";

export const useTriggerAlertsOnErrors = (...errors: Error[]) => {
  const [, dispatch] = useGlobalStateContext();
  const { t } = usePluginTranslations();

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
              dismissable: true,
            },
          });
        }
      }
    },
    // Safe to ignore: 't' and 'dispatch'
    [errors]
  );
};
