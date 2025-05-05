import { createContext } from "react";
import type { FileSystem } from "@/models/ibm-spectrum-scale/FileSystem";

type FileSystemTableCtxValue = {
  filesystem: FileSystem | undefined;
  setFileSystem: (fs: FileSystem | undefined) => void;
};

export const FileSystemTableContext = createContext<FileSystemTableCtxValue>({
  filesystem: undefined,
  setFileSystem: () => {},
});
