#!/bin/bash
set -x -e -o pipefail

CATALOGSOURCE="test-openshift-storage-scale-operator"
NS="openshift-storage-scale"
OPERATOR="openshift-storage-scale-operator"
VERSION="${VERSION:-6.6.6}"
REGISTRY="${REGISTRY:-kuemper.int.rhx/bandini}"

wait_for_resource() {
    local resource_type=$1  # Either "packagemanifest", "operator", or "csv"
    local name=$2           # Name of the resource (e.g., Operator or CSV)
    local namespace=$3      # Namespace (optional, required for CSV and Operator)
    local label=$4          # Label selector (only for packagemanifests)

    echo "⏳ Waiting for $resource_type: $name"
    while true; do
        set +e
        if [[ "$resource_type" == "packagemanifest" ]]; then
            oc get -n openshift-marketplace packagemanifests -l "catalog=${label}" --field-selector "metadata.name=${name}" &> /dev/null
        elif [[ "$resource_type" == "operator" ]]; then
            oc get operators.operators.coreos.com "${name}.${namespace}" &> /dev/null
        elif [[ "$resource_type" == "csv" ]]; then
            STATUS=$(oc get csv "$name" -n "$namespace" -o jsonpath='{.status.phase}' 2>/dev/null)
            if [[ "$STATUS" == "Succeeded" ]]; then
                echo "✅ Operator installation completed successfully!"
                break
            fi
            echo "⏳ Operator installation in progress... (Current status: ${STATUS:-Not Found})"
        else
            echo "❌ Unknown resource type: $resource_type"
            return 1
        fi
        ret=$?
        set -e
        
        if [[ $ret -eq 0 && "$resource_type" != "csv" ]]; then
            echo "✅ $resource_type: $name is available!"
            break
        fi
        
        sleep 10
    done
}

apply_subscription() {
    oc apply -f - <<EOF
    apiVersion: v1
    kind: Namespace
    metadata:
      name: ${NS}
    spec:
EOF
    oc apply -f - <<EOF
    apiVersion: operators.coreos.com/v1
    kind: OperatorGroup
    metadata:
      name: storage-scale-operator-group
      namespace: ${NS}
    spec:
      upgradeStrategy: Default
EOF
    oc apply -f - <<EOF
    apiVersion: operators.coreos.com/v1alpha1
    kind: Subscription
    metadata:
      name: ${OPERATOR}
      namespace: ${NS}
    spec:
      channel: fast
      installPlanApproval: Automatic
      name: ${OPERATOR}
      source: ${CATALOGSOURCE}
      sourceNamespace: openshift-marketplace
EOF
}

if [[ -n $(git status --porcelain) ]]; then
    echo "Uncommitted changes detected."
    exit 1
fi

make VERSION=${VERSION} IMAGE_TAG_BASE=${REGISTRY}/openshift-storage-scale CHANNELS=fast \
    bundle generate docker-build docker-push bundle-build bundle-push console-build console-push \
    devicefinder-docker-build devicefinder-docker-push catalog-build catalog-push catalog-install

wait_for_resource "packagemanifest" "${OPERATOR}" "" "${CATALOGSOURCE}"
apply_subscription
wait_for_resource "operator" "${OPERATOR}" "${NS}"

while true; do
    set +e
    INSTALLED_CSV=$(oc get subscription "${OPERATOR}" -n "${NS}" -o jsonpath='{.status.installedCSV}')
    if [ -z "${INSTALLED_CSV}" ]; then
        sleep 10
    else
        break
    fi
done

wait_for_resource "csv" "${INSTALLED_CSV}" "${NS}"
