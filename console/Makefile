# SHELL defines bash so all the inline scripts here will work as expected.
SHELL := /bin/bash

DEFAULT_VERSION := 0.0.1
VERSION ?= $(DEFAULT_VERSION)
export VERSION

# Override this when building images for dev only!
IMAGE_REGISTRY ?= quay.io/openshift-storage-scale

# For the default version, use 'latest' image tags.
# Otherwise version prefixed with 'v'
ifeq ($(VERSION), $(DEFAULT_VERSION))
IMAGE_TAG = latest
else
IMAGE_TAG = v$(VERSION)
endif
export IMAGE_TAG

# Image pullspec to use for all building/pushing image targets
IMG ?= $(IMAGE_REGISTRY)/openshift-storage-scale-operator-console:$(IMAGE_TAG)

.PHONY: help
help: ## Display this help.
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

.PHONY: lint
lint: # Install and lint
	yarn install && yarn lint

.PHONY: clean
clean: ## Clean node_modules and yarn cache to avoid disk space issues
	rm -rf node_modules && yarn cache clean

.PHONY: docker-build
docker-build: ## Build the docker image
	podman build --build-arg VERSION=$(VERSION) -t ${IMG} .

.PHONY: docker-push
docker-push: ## Push the docker image
	podman push ${IMG}
