import convert, { type Unit } from "convert";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import { hasLabel } from "@/utils/console/K8sResourceCommon";
import type {
  SuffixBinarySI,
  SuffixDecimalSI,
} from "./IoK8sApimachineryPkgApiResourceQuantity";
import {
  BinarySI,
  parseQuantity,
} from "./IoK8sApimachineryPkgApiResourceQuantity";
import {
  CPLANE_NODE_ROLE_LABEL,
  MASTER_NODE_ROLE_LABEL,
  MINIMUM_AMOUNT_OF_MEMORY,
  STORAGE_ROLE_LABEL,
  VALUE_NOT_AVAILABLE,
  WORKER_NODE_ROLE_LABEL,
} from "@/constants";

export type NodeRoles =
  | "worker"
  | "master"
  | "control-plane"
  | typeof VALUE_NOT_AVAILABLE;

export const getRole = (node: IoK8sApiCoreV1Node): NodeRoles => {
  let role: NodeRoles = VALUE_NOT_AVAILABLE;
  switch (true) {
    case hasLabel(node, `${WORKER_NODE_ROLE_LABEL}=`):
      role = "worker";
      break;
    case hasLabel(node, `${MASTER_NODE_ROLE_LABEL}=`):
      role = "master";
      break;
    case hasLabel(node, `${CPLANE_NODE_ROLE_LABEL}=`):
      role = "control-plane";
      break;
  }

  return role;
};

export const getMemory = (
  node: IoK8sApiCoreV1Node,
  displayUnit: Extract<
    "B" | `${SuffixBinarySI | SuffixDecimalSI}B`,
    Unit
  > = "GiB"
): [string, null] | [null, Error] => {
  if (!node.status?.capacity?.memory) {
    return [null, new Error("node's memory is not available")];
  }

  const [q, qError] = parseQuantity(node.status.capacity.memory);
  if (qError) {
    return [null, qError];
  }

  let adaptedValue: number = q.value;
  let adaptedUnit: Extract<"B" | `${SuffixBinarySI | SuffixDecimalSI}B`, Unit>;
  switch (q.unit) {
    case "B":
      adaptedUnit = q.unit;
      break;
    case "E": // unsupported by "convert"
      adaptedUnit = "PB";
      adaptedValue = q.value * 1000;
      break;
    case "Ei": // unsupported by "convert"
      adaptedUnit = "PiB";
      adaptedValue = q.value * 1024;
      break;
    default:
      adaptedUnit = (q.unit + "B") as `${Exclude<
        "Ei" | "E",
        SuffixBinarySI | SuffixDecimalSI
      >}B`;
      break;
  }

  const quantity = convert(adaptedValue, adaptedUnit).to(displayUnit);
  return [`${quantity.toFixed(2)} ${displayUnit}`, null];
};

export const getCpu = (node: IoK8sApiCoreV1Node) => node.status?.capacity?.cpu;

export const getSelectedNodes = (nodes: IoK8sApiCoreV1Node[]) =>
  nodes.filter((n) => hasLabel(n, STORAGE_ROLE_LABEL));

const [minQuantity, minUnits] = MINIMUM_AMOUNT_OF_MEMORY.split(" ");
const minUnitsInBytes =
  BinarySI[minUnits.slice(0, -1) as keyof typeof BinarySI];
export const getNodesWithMinimumAmountOfMemory = (
  nodes: IoK8sApiCoreV1Node[]
) =>
  nodes.filter((node) => {
    const [memory] = getMemory(node);
    const [quantity, units] = memory?.split(" ") ?? [];
    const unitsInBytes = BinarySI[units.slice(0, -1) as keyof typeof BinarySI];

    return (
      minUnitsInBytes * parseFloat(minQuantity) <=
      unitsInBytes * parseFloat(quantity)
    );
  });
