import { useMemo } from "react";
import type { TableColumn } from "@openshift-console/dynamic-plugin-sdk";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import type { FileSystem } from "@/models/ibm-spectrum-scale/FileSystem";

export type UseFileSystemsTableColumns = () => TableColumn<FileSystem>[];
export const useFileSystemsTableColumns: UseFileSystemsTableColumns = () => {
  const { t } = useFusionAccessTranslations();
  return useMemo(
    () => [
      {
        id: "name",
        title: t("Name"),
      },
      {
        id: "status",
        title: t("Status"),
        props: { className: "pf-v5-u-text-align-center" },
      },
      {
        id: "raw-capacity",
        title: t("Raw capacity"),
        props: { className: "pf-v5-u-text-align-center" },
      },
      {
        id: "gpfs-dashboard-link",
        title: t("Link to GPFS dashboard"),
        props: { className: "pf-v5-u-text-align-center" },
      },
      {
        id: "actions",
        title: "Actions",
        props: { className: "pf-v5-u-text-align-center" },
      },
    ],
    [t]
  );
};
