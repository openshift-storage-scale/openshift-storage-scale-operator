import { useMemo } from "react";
import type {
  DiscoveredDevice,
  LocalVolumeDiscoveryResult,
} from "@/models/fusionstorage/LocalVolumeDiscoveryResult";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";

export const useNodeSharedDisksCount = (
  nodeName: string,
  isSelected: boolean,
  selectedNodes: IoK8sApiCoreV1Node[],
  discoveryResults: LocalVolumeDiscoveryResult[]
) =>
  useMemo(() => {
    if (!isSelected || selectedNodes.length === 0) {
      return 0;
    }

    // Filter out discovery results that don't belong to the selected nodes
    const discoveryResultsForSelectedNodes = discoveryResults.filter((result) =>
      selectedNodes.some((node) => node.metadata?.name === result.spec.nodeName)
    );

    // If selected nodes have no discovery results, return 0
    if (discoveryResultsForSelectedNodes.length === 0) {
      return 0;
    }

    // Get the WWNs of the given node
    const nodeWwns = new Set(
      discoveryResults
        .find((result) => result.spec.nodeName === nodeName)
        ?.status.discoveredDevices?.map(({ WWN }) => WWN) ?? []
    );

    // If the given node has no WWNs, return 0
    if (nodeWwns.size === 0) {
      return 0;
    }

    // Simplify the argument structure by mapping node names to a Set of their discovered devices WWNs
    const selectedNodeNamesToDiscoveredDeviceWwnsMap =
      discoveryResultsForSelectedNodes.reduce(
        (map, item) => {
          const nodeName = item.spec.nodeName; // Likely safe to assume nodeName is unique...
          const nodeDiscoveredDevicesWwns = new Set(
            item.status.discoveredDevices?.map(({ WWN }) => WWN) ?? []
          );

          if (map.has(nodeName)) {
            // ...but just in case.
            map.set(
              nodeName,
              map.get(nodeName)!.union(nodeDiscoveredDevicesWwns)
            );
          } else {
            map.set(nodeName, nodeDiscoveredDevicesWwns);
          }

          return map;
        },
        new Map() as Map<string, Set<DiscoveredDevice["WWN"]>>
      );

    // Gather all WWNs toghether but exclude those in the given node
    const allOtherSelectedNodesDiscoveredDevicesWwns =
      selectedNodeNamesToDiscoveredDeviceWwnsMap
        .entries()
        .reduce(
          (set, [name, wnns]) => (name !== nodeName ? set.union(wnns) : set),
          new Set<DiscoveredDevice["WWN"]>()
        );

    // If no other selected nodes are found, return 0
    if (allOtherSelectedNodesDiscoveredDevicesWwns.size === 0) {
      return 0;
    }

    // Count the number of shared disks in the given node with all other nodes
    const sharedDisksWwns =
      allOtherSelectedNodesDiscoveredDevicesWwns.intersection(nodeWwns);

    return sharedDisksWwns.size;
  }, [isSelected, selectedNodes, discoveryResults, nodeName]);
