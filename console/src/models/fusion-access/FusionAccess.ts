import type { K8sResourceKind } from "@openshift-console/dynamic-plugin-sdk";

export interface FusionAccess extends K8sResourceKind {
  spec?: {
    ibm_cnsa_version?: "v5.2.2.1" | "v5.2.3.0.rc1";
    storagedevicediscovery?: {
      create?: boolean;
    };
  };
  status?: {
    conditions?: Array<{
      lastTransitionTime: string;
      message: string;
      status: "True" | "False" | "Unknown";
      type: string;
    }>;
    externalImagePullError?: string;
    externalImagePullStatus?: number;
    observedGeneration?: number;
    totalProvisionedDeviceCount?: number;
  };
}
