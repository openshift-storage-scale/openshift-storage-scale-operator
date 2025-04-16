import { useMemo } from "react";
import type {
  DiscoveredDevice,
  LocalVolumeDiscoveryResult,
} from "@/models/fusionstorage/LocalVolumeDiscoveryResult";

export const useNodeSharedDisksCounts = (
  discoveryResults: LocalVolumeDiscoveryResult[]
) =>
  useMemo(() => {
    // Simplify the argument structure mapping node names to their Set of discovered device WWNs
    const nodeDiscoveredDeviceWWNsMap = discoveryResults.reduce(
      (map, item) => {
        const nodeName = item.spec.nodeName; // Likely safe to assume nodeName is unique
        const nodeDiscoveredDevicesWWNs = new Set(
          item.status.discoveredDevices?.map(({ WWN }) => WWN) ?? []
        );
        if (map.has(nodeName)) {
          // But just in case...
          map.set(
            nodeName,
            map.get(nodeName)!.union(nodeDiscoveredDevicesWWNs)
          );
        } else {
          map.set(nodeName, nodeDiscoveredDevicesWWNs);
        }
        return map;
      },
      new Map() as Map<string, Set<DiscoveredDevice["WWN"]>>
    );

    // Get all the WWWNs from all nodes
    let allDiscoveredDevicesWWNsSet = new Set<string>();
    for (const discoveredDevices of nodeDiscoveredDeviceWWNsMap.values()) {
      allDiscoveredDevicesWWNsSet = allDiscoveredDevicesWWNsSet.union(
        discoveredDevices
      );
    }

    // Count the number of shared disks by node
    const nodeSharedDisksCounts = new Map<string, number>();
    for (const [
      nodeName,
      discoveredDevicesWWNs,
    ] of nodeDiscoveredDeviceWWNsMap) {
      nodeSharedDisksCounts.set(
        nodeName,
        allDiscoveredDevicesWWNsSet.intersection(discoveredDevicesWWNs).size
      );
    }

    return nodeSharedDisksCounts;
  }, [discoveryResults]);
