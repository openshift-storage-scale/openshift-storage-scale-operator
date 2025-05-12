import type { DiscoveredDevice } from "@/models/fusion-access/LocalVolumeDiscoveryResult";

const WWN_PREFIX_LENGTH = "uuid.".length;

export const getWwn = (device: DiscoveredDevice) =>
  device.WWN.slice(WWN_PREFIX_LENGTH);
