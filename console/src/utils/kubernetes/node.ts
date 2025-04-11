import type { IoK8sApiCoreV1Node } from "@/models/kubernetes/types-1.30";
import { parseQuantity } from "./quantity";
import type { SuffixBinarySI, SuffixDecimalSI } from "./unit";
import convert, { type Unit } from "convert";

export type NodeRole = "worker" | "master" | "control-plane";

export const getRole = (
  node: IoK8sApiCoreV1Node
): [NodeRole, null] | [null, Error] => {
  if (!("metadata" in node)) {
    return [null, new Error("cannot read node's metadata")];
  }

  if (!("labels" in node.metadata!)) {
    return [null, new Error("cannot read node's metadata labels")];
  }

  const nodeRoleLabel = Object.keys(node.metadata!.labels!).find((label) =>
    label.startsWith("node-role.kubernetes.io")
  );

  if (!nodeRoleLabel) {
    return [null, new Error("could not find node-role label")];
  }

  const [_, role] = nodeRoleLabel.split("/");
  return [role as NodeRole, null];
};

export const getMemory = (
  node: IoK8sApiCoreV1Node
): [string, null] | [null, Error] => {
  const [q, qError] = parseQuantity(node.status!.capacity!.memory);
  if (qError) {
    return [null, qError];
  }

  let adaptedValue: number = q.value;
  let adaptedUnit: Extract<
    "m" | "B" | `${SuffixBinarySI | SuffixDecimalSI}B`,
    Unit
  >;
  switch (q.unit) {
    case "m": // TODO(jkilzi): Verify it refers to millis as a fraction of CPU or RAM
    case "B": // refers to "bytes"
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

  const quantity = convert(adaptedValue, adaptedUnit).to("GiB");
  return [`${quantity.toFixed(2)} GiB`, null];
};
