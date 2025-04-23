import { useContext } from "react";
import { type StoreContextValue, StoreContext } from "@/contexts/store/context";

export const useStoreContext = () => {
  const context = useContext<StoreContextValue>(StoreContext);
  if (!context) {
    throw new Error("useStore hook must be used within <StoreProvider>");
  }

  return context;
};
