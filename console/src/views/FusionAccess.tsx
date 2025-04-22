import { StoreProvider } from "@/contexts/store/context";
import { reducer, initialState } from "@/contexts/store/reducer";
import { FusionAccessApp } from "@/components/FusionAccessApp";

const FusionAccess: React.FC = () => {
  return (
    <StoreProvider reducer={reducer} initialState={initialState}>
      <FusionAccessApp />
    </StoreProvider>
  );
};

FusionAccess.displayName = "FusionAccess";
export default FusionAccess;
