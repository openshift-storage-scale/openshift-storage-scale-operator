#!/usr/bin/env bash

set -euo pipefail
[[ -n "${DEBUGME+x}" ]] && set -x

script_name="${BASH_SOURCE[0]:-$0}"
script_path="$(realpath "$script_name")"
script_dir_path="$(dirname "$script_path")"
project_dir_path="$(dirname "$script_dir_path")"

PLUGIN_NAME="$(jq -r '.name' "$project_dir_path/package.json")"

CONSOLE_VERSION=${CONSOLE_VERSION:="latest"}
CONSOLE_IMAGE=${CONSOLE_IMAGE:="quay.io/openshift/origin-console:$CONSOLE_VERSION"}
CONSOLE_PORT=${CONSOLE_PORT:=9000}
CONSOLE_IMAGE_PLATFORM=${CONSOLE_IMAGE_PLATFORM:="linux/amd64"}

echo "Starting local OpenShift console v${CONSOLE_VERSION}..."

BRIDGE_I18N_NAMESPACES="plugin__${PLUGIN_NAME}"
BRIDGE_USER_AUTH="disabled"
BRIDGE_USER_SETTINGS_LOCATION="localstorage"
BRIDGE_K8S_MODE="off-cluster"
BRIDGE_K8S_AUTH_BEARER_TOKEN=$(oc whoami --show-token 2>/dev/null)
BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=$(oc whoami --show-server)
BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS=true
# The monitoring operator is not always installed (e.g. for local OpenShift). Tolerate missing config maps.
set +e
BRIDGE_K8S_MODE_OFF_CLUSTER_THANOS=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.thanosPublicURL}' 2>/dev/null)
BRIDGE_K8S_MODE_OFF_CLUSTER_ALERTMANAGER=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.alertmanagerPublicURL}' 2>/dev/null)
set -e

# Don't fail if the cluster doesn't have gitops.
set +e
GITOPS_HOSTNAME=$(oc -n openshift-gitops get route cluster -o jsonpath='{.spec.host}' 2>/dev/null)
set -e
if [ -n "$GITOPS_HOSTNAME" ]; then
    BRIDGE_K8S_MODE_OFF_CLUSTER_GITOPS="https://$GITOPS_HOSTNAME"
fi

echo "API Server: $BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT"
echo "Console Image: $CONSOLE_IMAGE"
echo "Console URL: http://localhost:${CONSOLE_PORT}"
echo "Console Platform: $CONSOLE_IMAGE_PLATFORM"

# Prefer podman if installed. Otherwise, fall back to docker.
function pocker {
    $(command -v podman || command -v docker) "$@"
}

pocker_args=(
    --rm
    --pull=always
    --platform="$CONSOLE_IMAGE_PLATFORM"
    --name="console-$CONSOLE_VERSION"
)

if [ -x "$(command -v podman)" ]; then
    if [ "$(uname -s)" = "Linux" ]; then
        # Use host networking on Linux since host.containers.internal is unreachable in some environments.
        BRIDGE_PLUGINS="${PLUGIN_NAME}=http://localhost:9001"
        pocker_args+=(--network=host)
    else
        BRIDGE_PLUGINS="${PLUGIN_NAME}=http://host.containers.internal:9001"
        pocker_args+=(-p="$CONSOLE_PORT:9000")
    fi
else
    BRIDGE_PLUGINS="${PLUGIN_NAME}=http://host.docker.internal:9001"
    pocker_args+=(-p="$CONSOLE_PORT:9000")
fi

pocker run "${pocker_args[@]}" --env-file=<(set | grep BRIDGE) $CONSOLE_IMAGE
