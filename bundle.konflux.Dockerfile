FROM quay.io/konflux-ci/operator-sdk-builder:latest as builder

ARG OPERATOR_IMG="registry.stage.redhat.io/openshift-storage-scale-operator-tech-preview/controller-rhel9-operator@sha256:3a1c7db695e9115713d7babf3a37455c908e1285413cc2a7a04cc61a811a7aad"
ARG DEVICEFINDER_IMAGE="registry.stage.redhat.io/openshift-storage-scale-operator-tech-preview/devicefinder-rhel9@sha256:58ce8e008b8a14d98ff3ff1b3ae951c946aa1e3ebc6930d97dc7e31389368646"
ARG CONSOLE_PLUGIN_IMAGE="registry.stage.redhat.io/openshift-storage-scale-operator-tech-preview/storage-scale-operator-console-plugin-rhel9@sha256:322a29d5ecf8bd4e72ef811dd34ed4493a49e16306e98b1377c3d26e5fc53018"
ARG MUST_GATHER_IMAGE="registry.stage.redhat.io/openshift-storage-scale-operator-tech-preview/storage-scale-operator-must-gather-rhel9@sha256:c701119180467e377cdffb0df1d24cb6eb7c68999d3d375acd24d357af84979d"

COPY ./ /repo
WORKDIR /repo
RUN \
    kustomize build config/manifests/ \
    | envsubst \
    | operator-sdk generate bundle \
        -q \
        --overwrite \
        --version $(cat VERSION.txt) \
        --output-dir build \
        --channels development \
        --default-channel development \
        --use-image-digests && \
    operator-sdk bundle validate ./build

FROM scratch

LABEL controller-rhel9-operator=${OPERATOR_IMG}
LABEL devicefinder=${DEVICEFINDER_IMAGE}
LABEL console-plugin=${CONSOLE_PLUGIN_IMAGE}
LABEL must-gather=${MUST_GATHER_IMAGE}

COPY --from=builder /repo/build/manifests /manifests/
COPY --from=builder /repo/build/metadata /metadata/

COPY --from=builder licenses /licenses/

USER 1001
# These are three labels needed to control how the pipeline should handle this container image
# This first label tells the pipeline that this is a bundle image and should be
# delivered via an index image
LABEL com.redhat.delivery.operator.bundle=true

# This second label tells the pipeline which versions of OpenShift the operator supports.
# This is used to control which index images should include this operator.
LABEL com.redhat.openshift.versions="v4.18"

# This third label tells the pipeline that this operator should *also* be supported on OCP 4.4 and
# earlier.  It is used to control whether or not the pipeline should attempt to automatically
# backport this content into the old appregistry format and upload it to the quay.io application
# registry endpoints.
LABEL com.redhat.delivery.backport=false

# The rest of these labels are copies of the same content in annotations.yaml and are needed by OLM
LABEL operators.operatorframework.io.bundle.mediatype.v1=registry+v1
LABEL operators.operatorframework.io.bundle.manifests.v1=manifests/
LABEL operators.operatorframework.io.bundle.metadata.v1=metadata/
LABEL operators.operatorframework.io.bundle.package.v1=mtv-operator
LABEL operators.operatorframework.io.bundle.channels.v1=release-v2.7
LABEL operators.operatorframework.io.bundle.channel.default.v1=release-v2.7

# Not sure whate these label expand to
LABEL operators.operatorframework.io.metrics.builder=operator-sdk-v1.22.0+git
LABEL operators.operatorframework.io.metrics.mediatype.v1=metrics+v1
LABEL operators.operatorframework.io.metrics.project_layout=ansible.sdk.operatorframework.io/v1
LABEL operators.operatorframework.io.test.config.v1=tests/scorecard/
LABEL operators.operatorframework.io.test.mediatype.v1=scorecard+v1



LABEL \
    com.redhat.component="OpenShift Storage Scale Operator" \
    distribution-scope="public" \
    name="openshift-storage-scale-bundle" \
    release="v1.0" \
    version="v1.0" \
    maintainer="Red Hat jgil@redhat.com" \
    url="https://github.com/openshift-storage-scale/openshift-storage-scale-operator.git" \
    vendor="Red Hat, Inc." \
    description="" \
    io.k8s.description="" \
    summary="" \
    io.k8s.display-name="OpenShift Storage Scale Operator" \
    io.openshift.tags="openshift,storage,scale" \
    License="Apache License 2.0" \