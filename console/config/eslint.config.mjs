// @ts-check
import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-config-prettier/flat";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import cypressPlugin from "eslint-plugin-cypress/flat";
import packageJson from "../package.json" with { type: "json" };

function detectSourceTypeFromPackageJson() {
  return "type" in packageJson && packageJson.type === "module"
    ? "module"
    : "commonjs";
}

let config = tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
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
    files: ["src/**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    ...reactPlugin.configs.flat["jsx-runtime"],
    ...reactHooksPlugin.configs["recommended-latest"],
  },
  {
    name: "Files in integration-tests/",
    files: ["integration-tests/**/*"],
    ...cypressPlugin.configs.recommended,
  },
  prettierPlugin // Must be the last one
);

export default config;
