#!/usr/bin/env bash

set -eu

codegen_output_dir="$(jq -r '.["generator-cli"].generators["k8s-1.30"].output' config/openapitools.json)"

npx openapi-generator-cli --openapitools config/openapitools.json generate --generator-key k8s-1.30
cp "$codegen_output_dir/models/index.ts" src/models/kubernetes/types-1.30.ts
rm -rf codegen
