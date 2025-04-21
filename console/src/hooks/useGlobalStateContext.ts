import { useContext } from "react";
import {
  type TGlobalStateContextValue,
  GlobalStateContext,
} from "@/contexts/global-state/context";

export const useGlobalStateContext = () => {
  const context = useContext<TGlobalStateContextValue>(GlobalStateContext);
  if (!context) {
    throw new Error("useStore hook must be used within <StoreProvider>");
  }

  return context;
};
