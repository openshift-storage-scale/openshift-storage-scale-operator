#!/usr/bin/env bash

set -euo pipefail
[[ -n "${DEBUGME+x}" ]] && set -x

script_name="${BASH_SOURCE[0]:-$0}"
script_path="$(realpath "$script_name")"
script_dir_path="$(dirname "$script_path")"
package_dir_path="$(dirname "$script_dir_path")"

FILE_PATTERN="src/**/*.{js,jsx,ts,tsx,json}"

yarn i18next "${FILE_PATTERN}" -c "$script_dir_path/i18n/i18next-parser.config.js" -o "$package_dir_path/locales/\$LOCALE/\$NAMESPACE.json"
