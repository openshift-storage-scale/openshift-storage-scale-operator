#!/bin/bash
set -e -o pipefail

VERSION=$(cat VERSION.txt)

make USE_IMAGE_DIGESTS="" bundle generate manifests docker-build docker-push \
    bundle-build bundle-push catalog-build catalog-push \
    console-build console-push devicefinder-docker-build devicefinder-docker-push

podman tag quay.io/openshift-storage-scale/openshift-storage-scale-catalog:${VERSION} quay.io/openshift-storage-scale/openshift-storage-scale-catalog:stable

podman push quay.io/openshift-storage-scale/openshift-storage-scale-catalog:stable
