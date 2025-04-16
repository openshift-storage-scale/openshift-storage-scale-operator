#!/usr/bin/env bash

# Expose the operator's version as an env variable
export VERSION=$(cat VERSION.txt)
# Generate the Dockefile replacing the VERSION value in the label to match the current version
envsubst < templates/$1.Dockerfile.template >$1.Dockerfile