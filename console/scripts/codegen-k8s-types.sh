#!/usr/bin/env bash

set -eu

KUBERNETES_RELEASE="${KUBERNETES_RELEASE:-1.30}"

codegen_output_dir="$(jq -r ".[\"generator-cli\"].generators[\"k8s-${KUBERNETES_RELEASE}\"].output" config/openapitools.json)"
destination_dir="src/models/kubernetes/${KUBERNETES_RELEASE}"
if [[ !(-d "$destination_dir") ]]; then
    mkdir -p $destination_dir
fi

npx openapi-generator-cli --openapitools config/openapitools.json generate --generator-key "k8s-${KUBERNETES_RELEASE}"
cp "$codegen_output_dir/models/index.ts" "$destination_dir/types.ts"
rm -rf codegen
