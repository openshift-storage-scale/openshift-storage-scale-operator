import fs from "node:fs";
import { CustomJsonLexer } from "./i18n/lexers.mjs";

const pwd = process.cwd();

/** @type {import('../package.json')} */
const packageJson = JSON.parse(
  fs.readFileSync(`${pwd}/package.json`).toString()
);

/** @typedef {import('i18next-parser').UserConfig} UserConfig */

/** @type {UserConfig} */
const config = {
  input: `${pwd}/src/**/*.{js,jsx,ts,tsx,json}`,
  output: `${pwd}/locales/$LOCALE/$NAMESPACE.json`,
  sort: true,
  createOldCatalogs: false,
  keySeparator: false,
  locales: ["en"],
  namespaceSeparator: "~",
  defaultNamespace: `plugin__${packageJson.name}`,
  defaultValue: (_locale, _namespace, key) => key,
  lexers: {
    hbs: ["HandlebarsLexer"],
    handlebars: ["HandlebarsLexer"],
    htm: ["HTMLLexer"],
    html: ["HTMLLexer"],
    mjs: ["JavascriptLexer"],
    js: ["JavascriptLexer"],
    ts: ["JavascriptLexer"],
    jsx: ["JsxLexer"],
    tsx: ["JsxLexer"],
    json: [CustomJsonLexer],
    default: ["JavascriptLexer"],
  },
};

export default config;
