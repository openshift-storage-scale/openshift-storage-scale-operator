import { type EncodedExtension } from "@openshift/dynamic-plugin-sdk-webpack";
import { type ConsolePluginBuildMetadata } from "@openshift-console/dynamic-plugin-sdk-webpack";
import packageJson from "../package.json";

export const pluginMetadata: ConsolePluginBuildMetadata = {
  name: packageJson.name,
  version: packageJson.version,
  displayName: "Fusion Access Plugin",
  exposedModules: {
    FusionAccessPage: "./views/fusion-access/FusionAccessPage.tsx",
  },
  dependencies: {
    "@console/pluginAPI": ">=4.17.0-0",
  },
};

export const extensions: EncodedExtension[] = [
  {
    type: "console.page/route",
    properties: {
      exact: true,
      path: "/example",
      component: { $codeRef: "FusionAccessPage" },
    },
  },
  {
    type: "console.navigation/href",
    properties: {
      id: "main",
      name: `%plugin__${packageJson.name}~Fusion Access for SAN%`,
      href: "/example",
      perspective: "admin",
      section: "storage",
    },
  },
];
