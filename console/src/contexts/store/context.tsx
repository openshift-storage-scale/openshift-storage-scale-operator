import { createContext } from "react";
import type { Actions, State } from "./types";
import { useImmerReducer, type ImmerReducer } from "use-immer";

export type StoreContextValue =
  | [Readonly<State>, React.Dispatch<Actions>]
  | null;

export const StoreContext = createContext<StoreContextValue>(null);

export interface GlobalStateProviderProps {
  reducer: ImmerReducer<State, Actions>;
  initialState: State;
}

export const StoreProvider: React.FC<GlobalStateProviderProps> = (props) => {
  const { children, initialState, reducer } = props;
  const stateAndDispatch = useImmerReducer(reducer, initialState);

  return (
    <StoreContext.Provider value={stateAndDispatch}>
      {children}
    </StoreContext.Provider>
  );
};
StoreProvider.displayName = "StoreProvider";
