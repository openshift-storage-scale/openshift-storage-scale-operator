import { useMemo } from "react";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";

export const useReactNodeWithPredefinedFallback = (
  SuccessNode: React.ReactNode,
  loaded: boolean,
  error: Error | string
): React.ReactNode => {
  return useMemo(() => {
    switch (true) {
      case !loaded:
        return <LoadingState />;
      case Boolean(error): {
        return (
          <ErrorState
            message={error instanceof Error ? error.message : error}
          />
        );
      }
      default:
        return SuccessNode;
    }
  }, [SuccessNode, error, loaded]);
};
