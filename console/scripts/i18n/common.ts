import fs from "node:fs";
import path from "node:path";
import process from "node:process";

export const isDirectory = (filePath: string) => {
  let result: boolean = true;
  try {
    const stat = fs.lstatSync(filePath);
    result = stat.isDirectory();
  } catch {
    // lstatSync throws an error if path doesn't exist
    result = false;
  }

  return result;
};

export const parseFolder = (
  directory: string,
  argFunction: (f: string, p: string) => void,
  packageDir: string = process.cwd()
) => {
  (async () => {
    try {
      const files = await fs.promises.readdir(directory);
      for (const file of files) {
        const filePath = path.join(directory, file);
        argFunction(filePath, packageDir);
      }
    } catch (e) {
      console.error(`Failed to parseFolder ${directory}:`, e);
    }
  })();
};

export const deleteFile = (filePath: string) => {
  try {
    fs.unlinkSync(filePath);
  } catch (e) {
    console.error(`Failed to delete file ${filePath}:`, e);
  }
};
