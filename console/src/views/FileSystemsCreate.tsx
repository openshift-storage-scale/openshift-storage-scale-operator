import { StoreProvider, useStoreContext } from "@/contexts/store/context";
import { reducer, initialState } from "@/contexts/store/reducer";
import { DownloadLogsButton } from "@/components/DownloadLogsButton";
import { FusionAccessListPage } from "@/components/FusionAccessListPage";
import { CreateFileSystemButton } from "@/components/CreateFileSystemButton";
import { useCreateFileSystemHandler } from "@/hooks/useCreateFileSystemHandler";
import { useFusionAccessTranslations } from "@/hooks/useFusionAccessTranslations";
import {
  Form,
  FormContextProvider,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextInput,
  useFormContext,
} from "@patternfly/react-core";
import { useCallback, useEffect, useMemo } from "react";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { useWatchLocalVolumeDiscoveryResult } from "@/hooks/useWatchLocalVolumeDiscoveryResult";
import { useWatchNode } from "@/hooks/useWatchNode";
import { STORAGE_ROLE_LABEL, WORKER_NODE_ROLE_LABEL } from "@/constants";
import convert from "convert";
import { ExclamationCircleIcon } from "@patternfly/react-icons";
import type {
  DiscoveredDevice,
  LocalVolumeDiscoveryResult,
} from "@/models/fusion-access/LocalVolumeDiscoveryResult";
import type { State, Actions } from "@/contexts/store/types";
import { HelpLabelIcon } from "@/components/HelpLabelIcon";
import { useTriggerAlertsOnErrors } from "@/hooks/useTriggerAlertsOnErrors";
import { getShortWwn } from "@/utils/fusion-access/LocalVolumeDiscoveryResult";

const NAME_FIELD_VALIDATION_REGEX = /^[a-zA-Z](\w|[_-])*\w$/;

const FileSystemsCreate: React.FC = () => {
  return (
    <StoreProvider<State, Actions>
      reducer={reducer}
      initialState={initialState}
    >
      <FormContextProvider>
        <ConnectedCreateFileSystems />
      </FormContextProvider>
    </StoreProvider>
  );
};
FileSystemsCreate.displayName = "FileSystemsCreate";
export default FileSystemsCreate;

const ConnectedCreateFileSystems: React.FC = () => {
  const [store, dispatch] = useStoreContext<State, Actions>();
  const { t } = useFusionAccessTranslations();
  const { getError, getValue } = useFormContext();
  const fileSystemName = getValue("name");
  const fileSystemNameErrorMessage = getError("name");
  const selectedLuns = useSelectedLuns(getValue("selected-luns"));

  const discoveryResultsForStorageNodes =
    useDisksDiscoveryResultsForStorageNodes();
  const discoveredDevices = useDiscoveredDevices(
    discoveryResultsForStorageNodes
  );
  const selectedDevices = useMemo(() => {
    const value = discoveredDevices.filter((d) =>
      selectedLuns.find((l) => l.id === getShortWwn(d))
    );
    return value;
  }, [discoveredDevices, selectedLuns]);

  useEffect(() => {
    const isDisabled =
      Boolean(fileSystemNameErrorMessage) || selectedDevices.length === 0;

    dispatch({
      type: "updateCtas",
      payload: { createFileSystem: { isDisabled } },
    });
  }, [dispatch, fileSystemNameErrorMessage, selectedDevices.length]);

  const handleCreateFileSystem = useCreateFileSystemHandler(
    fileSystemName,
    discoveryResultsForStorageNodes,
    selectedDevices
  );

  return (
    <FusionAccessListPage
      documentTitle={t("Create file system")}
      title={t("Create file system")}
      description={t(
        "Create a file system to represent your required storage (based on the selected nodes’ storage)."
      )}
      actions={[
        <DownloadLogsButton key="download-logs" />,
        <CreateFileSystemButton
          key="create-filesystem"
          type="submit"
          form="file-system-create-form"
          isDisabled={store.ctas.createFileSystem.isDisabled}
          isLoading={store.ctas.createFileSystem.isLoading}
          onCreateFileSystem={handleCreateFileSystem}
        />,
      ]}
      alerts={store.alerts}
    >
      <FileSystemCreateForm discoveredDevices={discoveredDevices} />
    </FusionAccessListPage>
  );
};
ConnectedCreateFileSystems.displayName = "ConnectedCreateFileSystems";

interface Lun {
  name: string;
  id: string;
  capacity: string;
}

interface FileSystemCreateFormProps {
  discoveredDevices: DiscoveredDevice[];
}

const FileSystemCreateForm: React.FC<FileSystemCreateFormProps> = (props) => {
  const { discoveredDevices } = props;
  const { getValue, setValue, getError, setError } = useFormContext();
  const { t } = useFusionAccessTranslations();

  const availableLuns = useConvertToLuns(discoveredDevices);
  const selectedLuns = useSelectedLuns(getValue("selected-luns"));

  const handleSelectLun = useCallback(
    (lun: Lun) =>
      (_event: React.FormEvent<HTMLInputElement>, isSelecting: boolean) => {
        const nextSelectedLuns = isSelecting
          ? selectedLuns.concat(lun)
          : selectedLuns.filter(({ id }) => id !== lun.id);
        setValue("selected-luns", JSON.stringify(nextSelectedLuns));
      },
    [selectedLuns, setValue]
  );

  const handleSelectAllLuns = useCallback(
    (_event: React.FormEvent<HTMLInputElement>, isSelecting: boolean) => {
      const nextSelectedLuns = isSelecting ? availableLuns : [];
      setValue("selected-luns", JSON.stringify(nextSelectedLuns));
    },
    [availableLuns, setValue]
  );

  const validateNameField = useCallback(() => {
    if (NAME_FIELD_VALIDATION_REGEX.test(getValue("name"))) {
      setError("name", undefined);
    } else {
      setError(
        "name",
        t("Must match the expression: {{NAME_FIELD_VALIDATION_REGEX}}", {
          NAME_FIELD_VALIDATION_REGEX,
        })
      );
    }
  }, [getValue, setError, t]);

  const handleNameChange = useCallback(
    (_event: React.FormEvent<HTMLInputElement>, newName: string) => {
      setValue("name", newName);
    },
    [setValue]
  );

  const fileSystemName = getValue("name");
  const fileSystemNameErrorMessage = getError("name");
  const columns = useColumns();

  return (
    <Form
      isWidthLimited
      id="file-system-create-form"
      onSubmit={(e) => {
        e.preventDefault();
        validateNameField();
      }}
    >
      <FormGroup isRequired label="Name" fieldId="name">
        <TextInput
          type="text"
          id="name"
          name="name"
          isRequired
          minLength={1}
          value={fileSystemName}
          placeholder="file-system-1"
          validated={fileSystemNameErrorMessage ? "error" : "default"}
          onChange={handleNameChange}
          onBlur={validateNameField}
        />
        {fileSystemNameErrorMessage ? (
          <FormHelperText>
            <HelperText>
              <HelperTextItem icon={<ExclamationCircleIcon />} variant="error">
                {fileSystemNameErrorMessage}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        ) : null}
      </FormGroup>
      <FormGroup
        isRequired
        fieldId="luns-selection-table"
        label="Select LUNs"
        labelIcon={
          <HelpLabelIcon
            popoverContent={t(
              "Select LUNs to designate the storage devices used in the file system."
            )}
          />
        }
      >
        <Table id="luns-selection-table" variant="compact">
          <Thead>
            <Tr>
              <Th
                aria-label="Select all LUNs"
                select={{
                  isSelected: availableLuns.length === selectedLuns.length,
                  onSelect: handleSelectAllLuns,
                }}
              />
              {Object.entries(columns).map(([name, value]) => (
                <Th key={name}>{value}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {availableLuns.map((lun, rowIndex) => (
              <Tr key={lun.id}>
                <Td
                  select={{
                    rowIndex,
                    isSelected: selectedLuns.some(({ id }) => id === lun.id),
                    onSelect: handleSelectLun(lun),
                  }}
                />
                <Td dataLabel={columns.NAME}>{lun.name}</Td>
                <Td dataLabel={columns.ID}>{lun.id}</Td>
                <Td dataLabel={columns.CAPACITY}>{lun.capacity}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </FormGroup>
    </Form>
  );
};
FileSystemCreateForm.displayName = "FileSystemCreateForm";

const useDisksDiscoveryResultsForStorageNodes =
  (): LocalVolumeDiscoveryResult[] => {
    const [disksDiscoveryResults, , disksDiscoveryResultsLoadError] =
      useWatchLocalVolumeDiscoveryResult({
        isList: true,
      });

    const [selectedNodes, , selectedNodesLoadError] = useWatchNode({
      isList: true,
      withLabels: [WORKER_NODE_ROLE_LABEL, STORAGE_ROLE_LABEL],
    });

    useTriggerAlertsOnErrors(
      disksDiscoveryResultsLoadError,
      selectedNodesLoadError
    );

    const results = useMemo(
      () =>
        disksDiscoveryResults.filter((result) =>
          selectedNodes.find(
            (node) => node.metadata?.name === result.spec.nodeName
          )
        ),
      [disksDiscoveryResults, selectedNodes]
    );

    return results;
  };

const dedupeDiscoveredDisks = (
  acc: DiscoveredDevice[],
  disk?: DiscoveredDevice
): DiscoveredDevice[] => {
  if (!disk) {
    return acc;
  }

  if (acc.some((d) => d.WWN === disk?.WWN)) {
    return acc;
  } else {
    return acc.concat(disk);
  }
};

const useDiscoveredDevices = (results: LocalVolumeDiscoveryResult[]) =>
  results
    .map((result) => result.status.discoveredDevices)
    .flat()
    .reduce(dedupeDiscoveredDisks, []);

const useSelectedLuns = (serializedLuns: string) =>
  useMemo(() => JSON.parse(serializedLuns || "[]") as Lun[], [serializedLuns]);

const useConvertToLuns = (discoveredDevices: DiscoveredDevice[]): Lun[] =>
  useMemo(
    () =>
      discoveredDevices.map((disk) => {
        const size = convert(disk.size, "B").to("GiB");
        const r = {
          name: disk.path,
          id: getShortWwn(disk),
          // Note: Usage of 'GB' is intentional here
          capacity: size.toFixed(2) + " GB",
        };

        return r;
      }),
    [discoveredDevices]
  );

const useColumns = () => {
  const { t } = useFusionAccessTranslations();
  return useMemo(
    () =>
      ({
        NAME: t("Name"),
        ID: t("ID"),
        CAPACITY: t("Capacity"),
      }) as const,
    [t]
  );
};
