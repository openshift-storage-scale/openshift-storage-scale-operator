import { useCallback } from "react";
import { k8sCreate, useK8sModel } from "@openshift-console/dynamic-plugin-sdk";
import { usePluginTranslations } from "@/hooks/usePluginTranslations";
import type { Cluster } from "@/models/ibm-spectrum-scale/Cluster";
import { STORAGE_ROLE_LABEL } from "../constants";
import { useGlobalStateContext } from "../contexts/global-state/GlobalStateContext";

const [storageRoleLabelKey, storageRoleLabelValue] =
  STORAGE_ROLE_LABEL.split("=");
const nodeSelector = { [storageRoleLabelKey]: storageRoleLabelValue };

export const useCreateStorageClusterHandler = () => {
  const [, dispatch] = useGlobalStateContext();
  const { t } = usePluginTranslations();

  const [storageScaleClusterModel] = useK8sModel({
    group: "scale.spectrum.ibm.com",
    version: "v1beta1",
    kind: "Cluster",
  });

  return useCallback(
    async () => {
      try {
        await k8sCreate<Cluster>({
          model: storageScaleClusterModel,
          data: {
            apiVersion: "scale.spectrum.ibm.com/v1beta1",
            kind: "Cluster",
            metadata: { name: "ibm-spectrum-scale-cluster" },
            spec: {
              license: { accept: true, license: "data-management" },
              pmcollector: {
                nodeSelector,
              },
              daemon: {
                nodeSelector,
              },
            },
          },
        });
      } catch (e) {
        dispatch({
          type: "addAlert",
          payload: {
            key: Date.now(),
            variant: "danger",
            title: t("An error occurred while creating resources "),
            description: (e as Error).message,
            dismissable: true,
          },
        });
      }
    },
    // Safe to ignore: 't', 'dispatch' and 'storageScaleClusterModel'
    []
  );
};
