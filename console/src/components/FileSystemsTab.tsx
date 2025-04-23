import { useFileSystemsTableColumns } from "@/hooks/useFileSystemsTableColumns";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import { useStoreContext } from "@/hooks/useStoreContext";
import { useTriggerAlertsOnErrors } from "@/hooks/useTriggerAlertsOnErrors";
import { useWatchFileSystem } from "@/hooks/useWatchFileSystems";
import type { FileSystem } from "@/models/ibm-spectrum-scale/FileSystem";
import { getName } from "@/utils/console/K8sResourceCommon";
import {
  TableData,
  VirtualizedTable,
  type RowProps,
} from "@openshift-console/dynamic-plugin-sdk";
import { Button, Tooltip } from "@patternfly/react-core";
import { TrashIcon } from "@patternfly/react-icons";
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

  useTriggerAlertsOnErrors(fileSystemsLoadedError);

  const columns = useFileSystemsTableColumns();

  return (
    <VirtualizedTable<FileSystem>
      data={fileSystems}
      unfilteredData={fileSystems}
      loaded={fileSystemsLoaded}
      loadError={fileSystemsLoadedError}
      columns={columns}
      Row={FileSystemsTabTableRow}
    />
  );
};
FileSystemsTab.displayName = "FileSystemsTab";

type FileSystemsTabTableRowProps = RowProps<FileSystem>;
const FileSystemsTabTableRow: React.FC<FileSystemsTabTableRowProps> = (
  props
) => {
  const { activeColumnIDs, obj: fileSystem } = props;
  const { t } = useFusionAccessTranslations();

  const name = getName(fileSystem);
  const status = "Ready"; // TODO(jkilzi): Find out how to determine the status
  const rawCapacity = "80 GiB"; // TODO(jkilzi): Find out how to get the rawCapacity
  const gpfsDashboardHref = "https://www.redhat.com"; // TODO(jkilzi): Find out how to get the gpfsDashboardHref

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        {name}
      </TableData>

      <TableData
        activeColumnIDs={activeColumnIDs}
        className="pf-v5-u-text-align-center"
        id="status"
      >
        {status}
      </TableData>

      <TableData
        activeColumnIDs={activeColumnIDs}
        className="pf-v5-u-text-align-center"
        id="raw-capacity"
      >
        {rawCapacity}
      </TableData>

      <TableData
        activeColumnIDs={activeColumnIDs}
        className="pf-v5-u-text-align-center"
        id="gpfs-dashboard-link"
      >
        <Button
          variant="link"
          target="_blank"
          rel="noopener noreferrer"
          href={gpfsDashboardHref}
        >
          {gpfsDashboardHref}
        </Button>
      </TableData>

      <TableData
        activeColumnIDs={activeColumnIDs}
        className="pf-v5-u-text-align-center"
        id="actions"
      >
        <Tooltip content={t("Delete")}>
          <Button variant="plain" icon={<TrashIcon />} />
        </Tooltip>
      </TableData>
    </>
  );
};

/*
{
  "apiVersion": "scale.spectrum.ibm.com/v1beta1",
  "kind": "Filesystem",
  "metadata": {
    "name": "example",
    "namespace": "default"
  },
  "spec": {}
}
*/
