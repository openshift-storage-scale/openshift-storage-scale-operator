FROM registry.redhat.io/multicluster-engine/must-gather-rhel9:v2.8@sha256:6eeee0c2ba7a267b01dd8544fe3d7b653b2448208a77ff9f2d0d1095fcfe2a97 AS builder

# Copy our scripts
COPY collection-scripts/* /usr/bin/

USER 1001

LABEL \
    com.redhat.component="Must gather image for OpenShift Storage Scale Operator" \
    io.k8s.display-name="Must gather image for OpenShift Storage Scale Operator" \
    io.k8s.description="" \
    io.openshift.tags="openshift,storage,scale" \
    distribution-scope="public" \
    name="openshift-storage-scale-must-gather-rhel9" \
    vendor="Red Hat, Inc." \
    version="v1.0" \
    release="v1.0" \
    summary="Must gather image" \
    description="" \
    maintainer="Red Hat jgil@redhat.com" \
    url="https://github.com/openshift-storage-scale/openshift-storage-scale-operator.git" \
    License="Apache License 2.0"
