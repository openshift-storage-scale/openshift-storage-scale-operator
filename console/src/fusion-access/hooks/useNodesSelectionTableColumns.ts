import { usePluginTranslations } from "@/hooks/usePluginTranslations";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
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
          id: "checkbox",
          title: "",
          props: { className: "pf-v5-c-table__check" },
        },
        {
          id: "name",
          title: t("Name"),
        },
        {
          id: "role",
          title: t("Role"),
          props: { className: "pf-v5-u-text-align-center" },
        },
        {
          id: "cpu",
          title: t("CPU"),
          props: { className: "pf-v5-u-text-align-center" },
        },
        {
          id: "memory",
          title: t("Memory"),
          props: { className: "pf-v5-u-text-align-center" },
        },
        {
          id: "shared-disks",
          title: t("Shared disks"),
          props: { className: "pf-v5-u-text-align-center" },
        },
      ],
      // Safe to ignore: 't'
      []
    );
  };
