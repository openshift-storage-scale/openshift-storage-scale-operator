import type { K8sModel } from "@openshift-console/dynamic-plugin-sdk";

export const NodeModel: K8sModel = {
  apiVersion: "v1",
  label: "Node",
  // t('public~Node')
  labelKey: "public~Node",
  plural: "nodes",
  abbr: "N",
  kind: "Node",
  id: "node",
  labelPlural: "Nodes",
  // t('public~Nodes')
  labelPluralKey: "public~Nodes",
};
