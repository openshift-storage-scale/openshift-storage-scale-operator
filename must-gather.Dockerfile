FROM registry.redhat.io/openshift4/ose-must-gather-rhel9:v4.18@sha256:b998280f8963abe163c0f74fcd9f56031350e8c0ee5ec05dc8aa2290ec26f0a4 AS builder

FROM registry.redhat.io/ubi9-minimal@sha256:ac61c96b93894b9169221e87718733354dd3765dd4a62b275893c7ff0d876869

USER 1001
#RUN microdnf install tar rsync

# Copy must-gather required binaries
COPY --from=builder /usr/bin/oc /usr/bin/oc

RUN mkdir licenses
COPY LICENSE licenses/


# Copy our scripts
#COPY collection-scripts/* /usr/bin/

ENTRYPOINT /usr/bin/gather

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