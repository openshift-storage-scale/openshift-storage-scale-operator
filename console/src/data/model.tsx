import { K8sGroupVersionKind, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
// import { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/common-types';

export const LocalVolumeDiscoveryResultKind: K8sGroupVersionKind = {
  version: 'v1alpha1',
  group: 'fusion.storage.openshift.io',
  kind: 'LocalVolumeDiscoveryResult',
};

export enum DeviceType {
  disk,
  mpath,
}

export type Device = {
  size: number; // 53687091200
  path: string; // /dev/sda
  fstype: string; // ''
  vendor: string; // 'QEMU    '
  model: string; // QEMU HARDDISK
  WWN: string; // '0x5000c50015ea7599'
  deviceID: string; // /dev/disk/by-id/wwn-0x5000c50015ea7599
  status: {
    state: string; //Available
  };
  serial: string; // seconddisk
  property: string; //Rotational
  type: DeviceType; //disk
};

export type LocalVolumeDiscoveryResultSpec = {
  spec?: {
    nodeName: string;
  };
  status?: {
    discoveredDevices?: Device[];
  };
} & K8sResourceCommon;
