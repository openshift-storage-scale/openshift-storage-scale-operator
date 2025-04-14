import type { K8sModel } from "@openshift-console/dynamic-plugin-sdk";

export class K8sModelBase {
  readonly #model: K8sModel;

  constructor(model: K8sModel) {
    this.#model = model;
  }

  get model() {
    return Object.freeze(this.#model);
  }

  toRef<K extends K8sModel>(
    this: K8sModelBase
  ): `${K["apiGroup"]}~${K["apiVersion"]}~${K["kind"]}` {
    const { apiGroup, apiVersion, kind } = this.#model;
    return `${apiGroup}~${apiVersion}~${kind}`;
  }

  toGroupVersionKind<K extends K8sModel>(
    this: K8sModelBase
  ): {
    version: K["apiVersion"];
    kind: K["kind"];
    group: K["apiGroup"];
  } {
    const { apiGroup, apiVersion, kind } = this.#model;
    return {
      version: apiVersion,
      kind: kind,
      group: apiGroup,
    };
  }
}
