import { type EncodedExtension } from "@openshift/dynamic-plugin-sdk-webpack";
import { type ConsolePluginBuildMetadata } from "@openshift-console/dynamic-plugin-sdk-webpack";
import packageJson from "../package.json";

export const pluginMetadata: ConsolePluginBuildMetadata = {
  name: packageJson.name,
  version: packageJson.version,
  displayName: "Fusion Access Plugin",
  exposedModules: {
    FusionAccessHome: "./views/FusionAccessHome.tsx",
    StorageClusterCreate: "./views/StorageClusterCreate.tsx",
    FileSystemsHome: "./views/FileSystemsHome.tsx",
    FileSystemsCreate: "./views/FileSystemsCreate.tsx",
  },
  dependencies: {
    "@console/pluginAPI": ">=4.18.0-0",
  },
};

export const extensions: EncodedExtension[] = [
  {
    type: "console.navigation/href",
    properties: {
      id: "main",
      name: `%plugin__${packageJson.name}~Fusion Access for SAN%`,
      href: "/fusion-access",
      perspective: "admin",
      section: "storage",
      insertBefore: "persistentvolumes",
    },
  },
  {
    type: "console.page/route",
    properties: {
      exact: true,
      path: "/fusion-access",
      component: { $codeRef: "FusionAccessHome" },
    },
  },
  {
    type: "console.page/route",
    properties: {
      exact: true,
      path: "/fusion-access/storage-cluster/create",
      component: { $codeRef: "StorageClusterCreate" },
    },
  },
  {
    type: "console.page/route",
    properties: {
      exact: true,
      path: "/fusion-access/file-systems",
      component: { $codeRef: "FileSystemsHome" },
    },
  },
  {
    type: "console.page/route",
    properties: {
      exact: true,
      path: "/fusion-access/file-systems/create",
      component: { $codeRef: "FileSystemsCreate" },
    },
  },
];
