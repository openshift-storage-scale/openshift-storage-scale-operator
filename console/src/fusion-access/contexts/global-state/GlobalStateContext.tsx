import { createContext, useContext, useReducer } from "react";
import type { Actions, State } from "./types";

export type TGlobalStateContextValue =
  | [Readonly<State>, React.Dispatch<Actions>]
  | null;

export const GlobalStateContext = createContext<TGlobalStateContextValue>(null);

export type GlobalStateProviderProps = {
  reducer: React.Reducer<Readonly<State>, Actions>;
  initialState: State;
};

export const GlobalStateProvider: React.FC<GlobalStateProviderProps> = (
  props
) => {
  const { children, initialState, reducer } = props;
  const stateAndDispatch = useReducer(reducer, initialState);

  return (
    <GlobalStateContext.Provider value={stateAndDispatch}>
      {children}
    </GlobalStateContext.Provider>
  );
};
GlobalStateProvider.displayName = "StateProvider";

export const useGlobalStateContext = () => {
  const context = useContext<TGlobalStateContextValue>(GlobalStateContext);
  if (!context) {
    throw new Error("useStore hook must be used within <StoreProvider>");
  }

  return context;
};
