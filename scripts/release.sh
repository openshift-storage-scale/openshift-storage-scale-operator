#!/bin/bash
set -e -o pipefail

VERSION=$(cat _VERSION)

make bundle generate manifests docker-build docker-push \
    bundle-build bundle-push catalog-build catalog-push \
    console-build console-push diskmaker-docker-build diskmaker-docker-push
podman tag quay.io/openshift-storage-scale/openshift-storage-scale-catalog:${VERSION} quay.io/openshift-storage-scale/openshift-storage-scale-catalog:stable
podman tag quay.io/openshift-storage-scale/openshift-storage-scale-diskmaker:${VERSION} quay.io/openshift-storage-scale/openshift-storage-scale-diskmaker:latest

podman push quay.io/openshift-storage-scale/openshift-storage-scale-catalog:stable
podman push quay.io/openshift-storage-scale/openshift-storage-scale-diskmaker:latest
