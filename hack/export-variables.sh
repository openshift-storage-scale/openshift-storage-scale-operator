#!/usr/bin/env bash

declare -A images

# The image refrences below will get updated by Konflux everytime there is a new image.

images[CONTROLLER_IMAGE]=quay.io/openshift-storage-scale/openshift-storage-scale-operator:latest

images[DEVICEFINDER_IMAGE]=quay.io/openshift-storage-scale/openshift-storage-scale-devicefinder:latest

images[CONSOLE_IMAGE]=quay.io/openshift-storage-scale/openshift-storage-scale-console:latest

# Chage the repository of the images to match the repository they would be pushed
# to during a release.

for k in "${!images[@]}"; do
    image="${images[$k]}"
    export "$k=$image"
done

export VERSION=$(cat ../VERSION.txt)