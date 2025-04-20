import { useMemo } from "react";
import type { LocalVolumeDiscoveryResult } from "@/models/fusion-storage/LocalVolumeDiscoveryResult";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";

export const useSharedDisksCount = (
  nodeName: string,
  isSelected: boolean,
  selectedNodes: IoK8sApiCoreV1Node[],
  discoveryResults: LocalVolumeDiscoveryResult[]
) =>
  useMemo(() => {
    if (!isSelected || selectedNodes.length === 0) {
      return 0;
    }

    // Only consider results from selected nodes
    const selectedDiscoveryResults = discoveryResults.filter((result) =>
      selectedNodes.some((node) => node.metadata?.name === result.spec.nodeName)
    );

    if (selectedDiscoveryResults.length === 0) {
      return 0;
    }

    // Get the WWNs of the input node
    const nodeDiscoveryResult = discoveryResults.find(
      (result) => result.spec.nodeName === nodeName
    );
    const nodeWwns = new Set(
      nodeDiscoveryResult?.status.discoveredDevices?.map(({ WWN }) => WWN) ?? []
    );

    if (nodeWwns.size === 0) {
      return 0;
    }

    // Gather WWNs for all other selected nodes
    const otherNodesWwns = new Set<string>();
    selectedDiscoveryResults.forEach((result) => {
      if (result.spec.nodeName !== nodeName) {
        result.status.discoveredDevices?.forEach(({ WWN }) => {
          otherNodesWwns.add(WWN);
        });
      }
    });

    if (otherNodesWwns.size === 0) {
      return 0;
    }

    // Count the number of shared disks
    const sharedDisksCount = nodeWwns.intersection(otherNodesWwns).size;

    return sharedDisksCount;
  }, [isSelected, selectedNodes, discoveryResults, nodeName]);
