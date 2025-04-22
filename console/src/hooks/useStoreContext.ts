import { useContext } from "react";
import {
  type TStoreContextValue,
  StoreContext,
} from "@/contexts/store/context";

export const useStoreContext = () => {
  const context = useContext<TStoreContextValue>(StoreContext);
  if (!context) {
    throw new Error("useStore hook must be used within <StoreProvider>");
  }

  return context;
};
