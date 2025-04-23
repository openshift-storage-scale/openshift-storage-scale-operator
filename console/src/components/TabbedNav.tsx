import { useEffect, useMemo } from "react";
import {
  HorizontalNav,
  type NavPage,
} from "@openshift-console/dynamic-plugin-sdk";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import { useTweakListPageBodyHeaderStyle } from "@/hooks/useTweakListPageBodyHeaderStyle";
import { useStoreContext } from "@/hooks/useStoreContext";
import { FileSystemsTab } from "./FileSystemsTab";

export const TabbedNav: React.FC = () => {
  const { t } = useFusionAccessTranslations();
  const [, dispatch] = useStoreContext();

  useTweakListPageBodyHeaderStyle({
    isFlex: true,
    isFilled: true,
    direction: "column",
  });

  useEffect(() => {
    dispatch({ type: "updatePage", payload: { description: " " } });
    dispatch({
      type: "updateCtas",
      payload: {
        createStorageCluster: {
          isDisabled: true,
          isHidden: true,
        },
      },
    });

    // Hacking until we figure out the href for the tabs, then <HorizontalNav> probably sets the doctitle.
    dispatch({
      type: "updateGlobal",
      payload: { documentTitle: t("File systems") },
    });
  }, [dispatch, t]);

  const pages: NavPage[] = useMemo(
    () => [
      {
        name: t("File systems"),
        href: "",
        component: FileSystemsTab,
      },
    ],
    [t]
  );

  return <HorizontalNav pages={pages} />;
};
TabbedNav.displayName = "TabbedNav";
