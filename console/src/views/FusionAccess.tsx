import { GlobalStateProvider } from "@/contexts/global-state/context";
import { reducer, initialState } from "@/contexts/global-state/reducer";
import { ListPage } from "@/components/ListPage";

const FusionAccess: React.FC = () => {
  return (
    <GlobalStateProvider reducer={reducer} initialState={initialState}>
      <ListPage />
    </GlobalStateProvider>
  );
};

FusionAccess.displayName = "FusionAccess";
export default FusionAccess;
