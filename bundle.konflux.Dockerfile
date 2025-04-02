FROM quay.io/konflux-ci/operator-sdk-builder:latest as builder

ARG OPERATOR_IMG="registry.stage.redhat.io/openshift-storage-scale-operator-tech-preview/controller-rhel9-operator@sha256:ba503417af04a2108bb3275956c162e4f41751097a10390c94d7594701d9f228"
ARG DEVICEFINDER_IMAGE="registry.stage.redhat.io/openshift-storage-scale-operator-tech-preview/devicefinder-rhel9@sha256:45e6dc46bc3b77e0ebe509c923f1b1a872741bc37a4e37aaff9d6ad7da13a987"
ARG CONSOLE_PLUGIN_IMAGE="registry.stage.redhat.io/openshift-storage-scale-operator-tech-preview/storage-scale-operator-console-plugin-rhel9@sha256:45613d1602db8f6189d1d89aa6a0674c75dc48ee569eafc4edf6e3bea1cb5641"
ARG MUST_GATHER_IMAGE="registry.stage.redhat.io/openshift-storage-scale-operator-tech-preview/storage-scale-operator-must-gather-rhel9@sha256:e3ff1754e7eb997ba7680121ed728e5d2e14e72fbf018f4cf42c39d72e576273"

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
        --default-channel development && \
    operator-sdk bundle validate ./build

FROM scratch

LABEL nudge.operator="registry.stage.redhat.io/openshift-storage-scale-operator-tech-preview/controller-rhel9-operator@sha256:ba503417af04a2108bb3275956c162e4f41751097a10390c94d7594701d9f228"
LABEL nudge.devicefinder="registry.stage.redhat.io/openshift-storage-scale-operator-tech-preview/devicefinder-rhel9@sha256:45e6dc46bc3b77e0ebe509c923f1b1a872741bc37a4e37aaff9d6ad7da13a987"
LABEL nudge.console="registry.stage.redhat.io/openshift-storage-scale-operator-tech-preview/storage-scale-operator-console-plugin-rhel9@sha256:45613d1602db8f6189d1d89aa6a0674c75dc48ee569eafc4edf6e3bea1cb5641"
LABEL nudge.must_gather="registry.stage.redhat.io/openshift-storage-scale-operator-tech-preview/storage-scale-operator-must-gather-rhel9@sha256:e3ff1754e7eb997ba7680121ed728e5d2e14e72fbf018f4cf42c39d72e576273"

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