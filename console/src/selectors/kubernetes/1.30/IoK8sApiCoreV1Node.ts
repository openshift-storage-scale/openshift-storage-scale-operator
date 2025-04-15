import convert, { type Unit } from "convert";
import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/1.30/types";
import { hasLabel } from "@/selectors/console/K8sResourceCommon";
import type {
  SuffixBinarySI,
  SuffixDecimalSI,
} from "./IoK8sApimachineryPkgApiResourceQuantity";
import { parseQuantity } from "./IoK8sApimachineryPkgApiResourceQuantity";

export type NodeRole = "worker" | "master" | "control-plane";

export const getRole = (node: IoK8sApiCoreV1Node): NodeRole => {
  let role: NodeRole = "worker";
  switch (true) {
    case hasLabel(node, "node-role.kubernetes.io/worker="):
      break;
    case hasLabel(node, "node-role.kubernetes.io/master="):
      role = "master";
      break;
    case hasLabel(node, "node-role.kubernetes.io/control-plane="):
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
