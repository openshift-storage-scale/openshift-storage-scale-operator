ARG TARGETARCH=amd64

FROM --platform=linux/$TARGETARCH brew.registry.redhat.io/rh-osbs/openshift-golang-builder@sha256:0a070e4a8f2698b6aba3630a49eb995ff1b0a182d0c5fa264888acf9d535f384 AS builder

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
    License="Apache License 2.0"
