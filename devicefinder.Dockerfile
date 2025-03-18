ARG TARGETARCH=amd64
ARG TARGETOS=linux
FROM --platform=$TARGETOS/$TARGETARCH brew.registry.redhat.io/rh-osbs/openshift-golang-builder@sha256:2e38fae8c9caa7a0e23c54f6d612bd3a4a4fc170514be7eb24f44ea1ff7861c9 AS builder

WORKDIR /workspace
COPY . .

RUN make build-devicefinder

FROM registry.redhat.io/rhel9/support-tools@sha256:0edcb9a34e61644d8039f55d077ccea8cb7c7141f1fcc16f9138e6d79a9ecd83

COPY --from=builder /workspace/_output/bin/devicefinder /usr/bin/

ENTRYPOINT ["/usr/bin/devicefinder"]

LABEL \
    com.redhat.component="Device Finder image for OpenShift Storage Scale Operator" \
    description="" \
    io.k8s.display-name="Device Finder image for OpenShift Storage Scale Operator" \
    io.k8s.description="" \
    io.openshift.tags="openshift,storage,scale" \
    distribution-scope="public" \
    name="openshift-storage-scale-devicefinder" \
    summary="Device Finder" \
    release="v1.0" \
    version="v1.0" \
    maintainer="Red Hat jgil@redhat.com" \
    url="https://github.com/openshift-storage-scale/openshift-storage-scale-operator.git" \
    vendor="Red Hat, Inc." \
    License="Apache License 2.0" \
