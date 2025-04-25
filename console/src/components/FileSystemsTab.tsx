import {
  TableData,
  VirtualizedTable,
  type RowProps,
} from "@openshift-console/dynamic-plugin-sdk";
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  Tooltip,
} from "@patternfly/react-core";
import {
  ExternalLinkAltIcon,
  FolderIcon,
  TrashIcon,
} from "@patternfly/react-icons";
import { useFileSystemsTableColumns } from "@/hooks/useFileSystemsTableColumns";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import { useTriggerAlertsOnErrors } from "@/hooks/useTriggerAlertsOnErrors";
import { useWatchFileSystem } from "@/hooks/useWatchFileSystems";
import type { FileSystem } from "@/models/ibm-spectrum-scale/FileSystem";
import { getName } from "@/utils/console/K8sResourceCommon";
import { CreateFileSystemButton } from "@/components/CreateFileSystemButton";
import { useHistory } from "react-router";
import { useCallback } from "react";

export const FileSystemsTab: React.FC = () => {
  const [fileSystems, fileSystemsLoaded, fileSystemsLoadedError] =
    useWatchFileSystem({ isList: true });

  // TODO(jkilzi): useTriggerAlertsOnErrors needs polishing...
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
      EmptyMsg={FileSystemsTableEmptyState}
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
FileSystemsTabTableRow.displayName = "FileSystemsTabTableRow";

const FileSystemsTableEmptyState: React.FC = () => {
  const { t } = useFusionAccessTranslations();
  const histroy = useHistory();
  const handleCreateFileSystem = useCallback(() => {
    histroy.push("/fusion-access/file-systems/create");
  }, [histroy]);

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={t("No file systems")}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={FolderIcon} />}
      />
      <EmptyStateBody>
        {t("You can create one by pressing the button below.")}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <CreateFileSystemButton onCreateFileSystem={handleCreateFileSystem} />
        </EmptyStateActions>
        <EmptyStateActions>
          <Button
            component="a"
            variant="link"
            target="_blank"
            rel="noopener noreferrer"
            href="#"
          >
            {t("Learn more about Fusion Access for SAN storage clusters")}{" "}
            <ExternalLinkAltIcon />
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};
FileSystemsTableEmptyState.displayName = "FileSystemsTableEmptyState";
