import { useEffect, useMemo } from "react";
import {
  HorizontalNav,
  type NavPage,
} from "@openshift-console/dynamic-plugin-sdk";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import { FileSystemsTab } from "./FileSystemsTab";
import { useListPageBodyHeaderStyle } from "@/hooks/useListPageBodyHeaderStyle";
import { useGlobalStateContext } from "@/hooks/useGlobalStateContext";

export const TabbedNav: React.FC = () => {
  useListPageBodyHeaderStyle({
    isFlex: true,
    isFilled: true,
    direction: "column",
  });
  const [state, dispatch] = useGlobalStateContext();

  useEffect(() => {
    dispatch({ type: "updatePageDescription", payload: "" });
    dispatch({
      type: "updateCreateStorageClusterCta",
      payload: {
        isDisabled: true,
        isHidden: true,
      },
    });
    dispatch({
      type: "updateCreateFileSystemCta",
      payload: {
        isDisabled: true,
        isHidden: false,
      },
    });
  }, [dispatch]);

  const { t } = useFusionAccessTranslations();

  const pages: NavPage[] = useMemo(
    () => [
      {
        href: "/file-systems",
        component: FileSystemsTab,
        name: t("File systems"),
      },
    ],
    [t]
  );

  return <HorizontalNav pages={pages} />;
};
TabbedNav.displayName = "TabbedNav";
