import { usePluginTranslations } from "@/hooks/usePluginTranslations";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/types-1.30";
import type { TableColumn } from "@openshift-console/dynamic-plugin-sdk";
import React from "react";

export type UseNodesSelectionTableColumns =
  () => TableColumn<IoK8sApiCoreV1Node>[];
export const useNodesSelectionTableColumns: UseNodesSelectionTableColumns =
  () => {
    const { t } = usePluginTranslations();
    return React.useMemo(
      () => [
        {
          id: "name",
          title: t("Name"),
        },
        {
          id: "role",
          title: t("Role"),
        },
        {
          id: "cpu",
          title: t("CPU"),
        },
        {
          id: "memory",
          title: t("Memory"),
        },
        {
          id: "shared-disks",
          title: t("Shared disks"),
        },
      ],
      []
    );
  };
