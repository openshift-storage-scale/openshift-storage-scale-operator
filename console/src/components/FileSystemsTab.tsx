import { useStoreContext } from "@/hooks/useStoreContext";
import { useWatchFileSystem } from "@/hooks/useWatchFileSystems";
import type { FileSystem } from "@/models/ibm-spectrum-scale/FileSystem";
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

  const [fileSystems, fileSystemsLoaded, fileSystemsLoadedError] =
    useWatchFileSystem({ isList: true });

  return (
    <VirtualizedTable<FileSystem>
      data={fileSystems}
      unfilteredData={fileSystems}
      loaded={fileSystemsLoaded}
      loadError={fileSystemsLoadedError}
      columns={[{}]}
      Row={() => null}
    />
  );
};
