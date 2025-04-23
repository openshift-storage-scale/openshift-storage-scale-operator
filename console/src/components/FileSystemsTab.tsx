import { useStoreContext } from "@/hooks/useStoreContext";
import { VirtualizedTable } from "@openshift-console/dynamic-plugin-sdk";
import { useEffect } from "react";

export const FileSystemsTab: React.FC = () => {
  const [, dispatch] = useStoreContext();
  useEffect(() => {
    dispatch({
      type: "updateCtas",
      payload: {
        createFileSystem: {
          isDisabled: true,
          isHidden: false,
        },
      },
    });
  }, [dispatch]);

  return (
    <VirtualizedTable
      data={[]}
      unfilteredData={[]}
      loaded={false}
      loadError={undefined}
      columns={[{  }]}
      Row={() => null}
    />
  );
  return null;
};
