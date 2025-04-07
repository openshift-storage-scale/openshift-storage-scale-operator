#!/usr/bin/env bash

for file in nudges/*.env
do . $file
done

cat templates/bundle.konflux.Dockerfile.template | envsubst >bundle.konflux.Dockerfile

