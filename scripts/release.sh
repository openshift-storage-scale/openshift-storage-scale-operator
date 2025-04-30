#!/bin/bash
set -e -o pipefail

VERSION=$(cat VERSION.txt)

make USE_IMAGE_DIGESTS="" bundle generate manifests docker-build docker-push \
    bundle-build bundle-push catalog-build catalog-push \
    console-build console-push devicefinder-docker-build devicefinder-docker-push \
    must-gather-docker-build must-gather-docker-push

podman tag quay.io/openshift-storage-scale/openshift-fusion-access-catalog:${VERSION} quay.io/openshift-storage-scale/openshift-fusion-access-catalog:latest
podman push quay.io/openshift-storage-scale/openshift-fusion-access-catalog:latest

echo "Containers for version ${VERSION} were built successfully"
echo "You can test it by using the 'openshift-fusion-access-catalog:latest' catalogsource"
echo ""
echo "Once you are happy with things you can update the stable catalog which is what QE uses internally by running the following:"
echo ""
echo "podman tag quay.io/openshift-storage-scale/openshift-fusion-access-catalog:${VERSION} quay.io/openshift-storage-scale/openshift-fusion-access-catalog:stable"
echo "podman push quay.io/openshift-storage-scale/openshift-fusion-access-catalog:stable"
