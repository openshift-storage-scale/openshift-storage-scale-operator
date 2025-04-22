import { useMemo } from "react";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import { getMemory } from "@/utils/kubernetes/1.30/IoK8sApiCoreV1Node";
import { BinarySI } from "@/utils/kubernetes/1.30/IoK8sApimachineryPkgApiResourceQuantity";
import { MINIMUM_AMOUNT_OF_MEMORY } from "@/constants";

const [minQuantity, minUnits] = MINIMUM_AMOUNT_OF_MEMORY.split(" ");
const minUnitsInBytes =
  BinarySI[minUnits.slice(0, -1) as keyof typeof BinarySI];

export const useNodesWithMinimumAmountOfMemory = (
  nodes: IoK8sApiCoreV1Node[]
) =>
  useMemo(
    () =>
      nodes.filter((node) => {
        const [memory] = getMemory(node);
        const [quantity, units] = memory?.split(" ") ?? [];
        const unitsInBytes =
          BinarySI[units.slice(0, -1) as keyof typeof BinarySI];

        return (
          minUnitsInBytes * parseFloat(minQuantity) <=
          unitsInBytes * parseFloat(quantity)
        );
      }),
    [nodes]
  );
