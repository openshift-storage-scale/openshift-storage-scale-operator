// @ts-check
import globals from "globals";
import packageJson from "../package.json" with { type: "json" };
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import reactPlugin from "eslint-plugin-react";
import * as reactHooksPlugin from "eslint-plugin-react-hooks";
import pluginCypress from "eslint-plugin-cypress/flat";

function detectSourceTypeFromPackageJson() {
  return "type" in packageJson && packageJson.type === "module"
    ? "module"
    : "commonjs";
}

let config = tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    // @see https://eslint.org/docs/latest/use/configure/migration-guide#ignoring-files
    name: "Additional ignores",
    ignores: ["dist/*"],
  },
  {
    name: "Detect source type from package.json",
    languageOptions: {
      sourceType: detectSourceTypeFromPackageJson(),
      globals: {
        ...globals.node,
      },
    },
  },
  {
    name: "Files in src/",
    files: ["src/*"],
    ...reactPlugin.configs.flat["jsx-runtime"],
    plugins: {
      ...reactPlugin.configs.flat["jsx-runtime"].plugins,
      "react-hooks": reactHooksPlugin,
    },
    linterOptions: {
      // This is needed for src/models/kubernetes/types-*.ts
      noInlineConfig: false,
    },
  },
  {
    name: "Files in integration-tests/",
    files: ["integration-tests/*"],
    ...pluginCypress.configs.recommended,
  },
  eslintConfigPrettier // Must be the last one
);

export default config;
