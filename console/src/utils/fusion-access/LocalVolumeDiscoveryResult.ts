import type { DiscoveredDevice } from "@/models/fusion-access/LocalVolumeDiscoveryResult";
import { WWN_LENGTH, WWN_SKIP_PREFIX_LENGTH } from "@/constants";

export const getShortWwn = (device: DiscoveredDevice, length = WWN_LENGTH) =>
  device.WWN.slice(WWN_SKIP_PREFIX_LENGTH, WWN_SKIP_PREFIX_LENGTH + length);
