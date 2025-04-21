import { GlobalStateProvider } from "../contexts/global-state/GlobalStateContext";
import { reducer, initialState } from "../contexts/global-state/reducer";
import { Page } from "./Page";

const Root: React.FC = () => {
  return (
    <GlobalStateProvider reducer={reducer} initialState={initialState}>
      <Page />
    </GlobalStateProvider>
  );
};

Root.displayName = "FusionAccessRoot";
export default Root;
