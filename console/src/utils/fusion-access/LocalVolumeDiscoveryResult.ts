import type { DiscoveredDevice } from "@/models/fusion-access/LocalVolumeDiscoveryResult";

const WWN_PREFIX_LENGTH = "uuid.".length;

export const getShortWwn = (device: DiscoveredDevice, length = 8) =>
  device.WWN.slice(WWN_PREFIX_LENGTH, WWN_PREFIX_LENGTH + length);
