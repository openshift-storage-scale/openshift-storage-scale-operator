import { useStoreContext } from "@/contexts/store/context";
import type { State, Actions } from "@/contexts/store/types";
import type {
  LocalVolumeDiscoveryResult,
  DiscoveredDevice,
} from "@/models/fusion-access/LocalVolumeDiscoveryResult";
import {
  k8sCreate,
  useK8sModel,
  type K8sModel,
} from "@openshift-console/dynamic-plugin-sdk";
import { useHistory } from "react-router";
import { useFusionAccessTranslations } from "./useFusionAccessTranslations";
import { useCallback } from "react";
import type { LocalDisk } from "@/models/ibm-spectrum-scale/LocalDisk";
import type { FileSystem } from "@/models/ibm-spectrum-scale/FileSystem";
import { getDigest } from "@/utils/crypto/hash";
import { getShortWwn } from "@/utils/fusion-access/LocalVolumeDiscoveryResult";

export const useCreateFileSystemHandler = (
  fileSystemName: string,
  discoveryResultsForStorageNodes: LocalVolumeDiscoveryResult[],
  selectedDevices: DiscoveredDevice[]
) => {
  const [, dispatch] = useStoreContext<State, Actions>();
  const { t } = useFusionAccessTranslations();
  const history = useHistory();

  const [localDiskModel] = useK8sModel({
    group: "scale.spectrum.ibm.com",
    version: "v1beta1",
    kind: "LocalDisk",
  });

  const [fileSystemModel] = useK8sModel({
    group: "scale.spectrum.ibm.com",
    version: "v1beta1",
    kind: "FileSystem",
  });

  return useCallback(async () => {
    try {
      dispatch({
        type: "updateCtas",
        payload: { createFileSystem: { isLoading: true } },
      });

      const localDisks = await createLocalDisks(
        discoveryResultsForStorageNodes,
        selectedDevices,
        localDiskModel,
        fileSystemName
      );

      await createFileSystem(localDisks, fileSystemModel, fileSystemName);

      history.push("/fusion-access/file-systems");
    } catch (e) {
      const description = e instanceof Error ? e.message : (e as string);
      const descriptionDigest = await getDigest(description);
      dispatch({
        type: "addAlert",
        payload: {
          key: descriptionDigest,
          variant: "danger",
          title: t("An error occurred while creating resources"),
          description,
          isDismissable: true,
        },
      });
    }

    dispatch({
      type: "updateCtas",
      payload: { createStorageCluster: { isLoading: false } },
    });
  }, [
    discoveryResultsForStorageNodes,
    dispatch,
    fileSystemModel,
    fileSystemName,
    history,
    localDiskModel,
    selectedDevices,
    t,
  ]);
};

function createFileSystem(
  localDisks: PromiseSettledResult<LocalDisk>[],
  fileSystemModel: K8sModel,
  fileSystemName: string
): Promise<FileSystem> {
  return k8sCreate<FileSystem>({
    model: fileSystemModel,
    data: {
      apiVersion: "scale.spectrum.ibm.com/v1beta1",
      kind: "FileSystem",
      metadata: { name: fileSystemName },
      spec: {
        local: {
          pools: [
            {
              disks: Array.from(
                new Set(
                  localDisks
                    .filter((ld) => ld.status === "fulfilled")
                    .map((ld) => ld.value.metadata?.name)
                    .filter(Boolean)
                )
              ) as string[],
            },
          ],
          // TODO(jkilzi): Check these 2 props below are correct. Marked in TS as required fields.
          replication: "1-way",
          type: "shared",
        },
      },
    },
  });
}

function createLocalDisks(
  discoveryResultsForStorageNodes: LocalVolumeDiscoveryResult[],
  selectedDevices: DiscoveredDevice[],
  localDiskModel: K8sModel,
  fileSystemName: string
) {
  const promises: Promise<LocalDisk>[] = [];
  for (const result of discoveryResultsForStorageNodes) {
    for (const device of result.status.discoveredDevices ?? []) {
      if (selectedDevices.some((d) => d.WWN === device.WWN)) {
        const localDiskName = `${fileSystemName}-localdisk-${getShortWwn(device)}`;
        const promise = k8sCreate<LocalDisk>({
          model: localDiskModel,
          data: {
            apiVersion: "scale.spectrum.ibm.com/v1beta1",
            kind: "LocalDisk",
            metadata: { name: localDiskName, namespace: "default" }, // TODO(jkilzi): Handle dynamic namespaces
            spec: {
              existingDataSkipVerify: true, // TODO(jkilzi): REMOVE it! Destroys data with no warning.
              device: device.deviceID,
              node: result.spec.nodeName,
            },
          },
        });
        promises.push(promise);
      }
    }
  }

  return Promise.allSettled(promises);
}
