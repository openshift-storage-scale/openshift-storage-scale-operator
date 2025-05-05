import { useCallback, useContext, useMemo, useState } from "react";
import { useHistory } from "react-router";
import {
  TableData,
  useK8sWatchResource,
  VirtualizedTable,
  type RowProps,
  type StorageClass,
  type TableColumn,
} from "@openshift-console/dynamic-plugin-sdk";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  MenuToggle,
  Popover,
} from "@patternfly/react-core";
import {
  EllipsisVIcon,
  ExternalLinkAltIcon,
  FolderIcon,
} from "@patternfly/react-icons";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import { useTriggerAlertsOnErrors } from "@/hooks/useTriggerAlertsOnErrors";
import { useWatchFileSystem } from "@/hooks/useWatchFileSystems";
import type { FileSystem } from "@/models/ibm-spectrum-scale/FileSystem";
import { getName } from "@/utils/console/K8sResourceCommon";
import { CreateFileSystemButton } from "@/components/CreateFileSystemButton";
import { VALUE_NOT_AVAILABLE } from "@/constants";
import TableDeleteFilesystemModal from "./modals/DeleteFilesystemModal";
import { getFilesystemStatus } from "@/utils/status/filesystem";
import { FileSystemTableContext } from "@/contexts/filesystemctx";
import type { IoK8sApiCoreV1PersistentVolumeClaim } from "@/models/kubernetes/1.30/types";

type TableObj = { fileSystem: FileSystem; isUsed: boolean };

export const FileSystemsTab: React.FC = () => {
  const [fileSystems, fileSystemsLoaded, fileSystemsLoadedError] =
    useWatchFileSystem({ isList: true });

  // TODO(jkilzi): useTriggerAlertsOnErrors needs polishing...
  useTriggerAlertsOnErrors(fileSystemsLoadedError);

  const columns = useFileSystemsTableColumns();
  const [deleteFs, setDeleteFs] = useState<FileSystem>();

  const [pvcs, pvcsLoaded, pvcsError] = useK8sWatchResource<
    IoK8sApiCoreV1PersistentVolumeClaim[]
  >({
    isList: true,
    namespaced: true,
    groupVersionKind: {
      version: "v1",
      kind: "PersistentVolumeClaim",
    },
  });

  const [scs, scsLoaded, scsError] = useK8sWatchResource<StorageClass[]>({
    isList: true,
    namespaced: true,
    groupVersionKind: {
      group: "storage.k8s.io",
      version: "v1",
      kind: "StorageClass",
    },
  });

  const tableFilesystems = useMemo<TableObj[]>(() => {
    const usedFilesystems = [
      ...scs.reduce((acc, sc) => {
        if (sc.provisioner === "spectrumscale.csi.ibm.com") {
          const filesystem = (sc.parameters as { volBackendFs?: string })?.[
            "volBackendFs"
          ];
          if (
            filesystem &&
            pvcs.some((pvc) => pvc.spec?.storageClassName === sc.metadata?.name)
          ) {
            acc.add(filesystem);
          }
        }
        return acc;
      }, new Set<string>()),
    ];
    return fileSystems.map((fileSystem) => ({
      fileSystem,
      isUsed: usedFilesystems.includes(fileSystem.metadata?.name || ""),
    }));
  }, [scs, pvcs, fileSystems]);

  return (
    <FileSystemTableContext.Provider
      value={{ filesystem: deleteFs, setFileSystem: setDeleteFs }}
    >
      <VirtualizedTable<TableObj>
        data={tableFilesystems}
        unfilteredData={tableFilesystems}
        loaded={fileSystemsLoaded && pvcsLoaded && scsLoaded}
        loadError={fileSystemsLoadedError || pvcsError || scsError}
        columns={columns}
        Row={FileSystemsTabTableRow}
        EmptyMsg={FileSystemsTableEmptyState}
      />
      <TableDeleteFilesystemModal />
    </FileSystemTableContext.Provider>
  );
};
FileSystemsTab.displayName = "FileSystemsTab";

type FileSystemsTabTableRowProps = RowProps<TableObj>;
const FileSystemsTabTableRow: React.FC<FileSystemsTabTableRowProps> = (
  props
) => {
  const {
    activeColumnIDs,
    obj: { fileSystem, isUsed },
  } = props;
  const { setFileSystem } = useContext(FileSystemTableContext);
  const { t } = useFusionAccessTranslations();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const name = getName(fileSystem);
  const status = getFilesystemStatus(fileSystem, t);
  const rawCapacity =
    fileSystem.status?.pools?.[0].totalDiskSize ?? VALUE_NOT_AVAILABLE; // TODO(jkilzi): Find out how to get the rawCapacity
  const gpfsDashboardHref = "https://www.redhat.com"; // TODO(jkilzi): Find out how to get the gpfsDashboardHref

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        {name}
      </TableData>

      <TableData activeColumnIDs={activeColumnIDs} id="status">
        {status.description ? (
          <Popover
            aria-label="Status popover"
            bodyContent={<div>{status.description}</div>}
          >
            <Button variant="link" isInline icon={status.icon}>
              {status.title}
            </Button>
          </Popover>
        ) : (
          <>
            {status.icon} {status.title}
          </>
        )}
      </TableData>

      <TableData activeColumnIDs={activeColumnIDs} id="raw-capacity">
        {rawCapacity}
      </TableData>

      <TableData activeColumnIDs={activeColumnIDs} id="gpfs-dashboard-link">
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
        id=""
        className="dropdown-kebab-pf pf-v5-c-table__action"
      >
        <Dropdown
          isOpen={isMenuOpen}
          onOpenChange={setIsMenuOpen}
          toggle={(toggleRef) => (
            <MenuToggle
              ref={toggleRef}
              aria-label="filesystem actions"
              variant="plain"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              isExpanded={isMenuOpen}
            >
              <EllipsisVIcon />
            </MenuToggle>
          )}
          shouldFocusToggleOnSelect
          popperProps={{ position: "right" }}
          style={{ whiteSpace: "nowrap" }}
        >
          <DropdownList>
            <DropdownItem
              onClick={() => {
                setFileSystem(fileSystem);
                setIsMenuOpen(false);
              }}
              isDisabled={status.id === "deleting" || isUsed}
              description={
                isUsed ? <div>{t("Filesystem is in use")}</div> : undefined
              }
            >
              {t("Delete")}
            </DropdownItem>
          </DropdownList>
        </Dropdown>
      </TableData>
    </>
  );
};
FileSystemsTabTableRow.displayName = "FileSystemsTabTableRow";

const useFileSystemsTableColumns = (): TableColumn<TableObj>[] => {
  const { t } = useFusionAccessTranslations();
  return useMemo(
    () => [
      {
        id: "name",
        title: t("Name"),
      },
      {
        id: "status",
        title: t("Status"),
      },
      {
        id: "raw-capacity",
        title: t("Raw capacity"),
      },
      {
        id: "gpfs-dashboard-link",
        title: t("Link to GPFS dashboard"),
      },
      {
        id: "",
        title: "",
        props: { className: "dropdown-kebab-pf pf-v5-c-table__action" },
      },
    ],
    [t]
  );
};

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
