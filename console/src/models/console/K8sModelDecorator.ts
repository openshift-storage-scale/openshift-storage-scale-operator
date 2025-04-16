import type {
  K8sGroupVersionKind,
  K8sModel,
} from "@openshift-console/dynamic-plugin-sdk";
import type { K8sResourceRef } from "./types";

export class K8sModelDecorator {
  readonly #model: K8sModel;

  constructor(model: K8sModel) {
    this.#model = model;
  }

  get model(): Readonly<K8sModel> {
    return Object.freeze(this.#model);
  }

  toRef(this: K8sModelDecorator): K8sResourceRef {
    const { apiGroup, apiVersion, kind } = this.#model;
    return apiGroup
      ? `${apiGroup}~${apiVersion}~${kind}`
      : `${apiVersion}~${kind}`;
  }

  toGroupVersionKind(this: K8sModelDecorator): K8sGroupVersionKind {
    const { apiGroup, apiVersion, kind } = this.#model;
    return {
      group: apiGroup,
      version: apiVersion,
      kind: kind,
    };
  }
}
