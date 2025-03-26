FROM registry.access.redhat.com/ubi9/nodejs-18:latest AS builder
ARG VERSION=0.0.1

WORKDIR /opt/app-root

USER root

COPY . .
# replace version in package.json
RUN sed -r -i "s|\"version\": \"0.0.0\"|\"version\": \"${VERSION}\"|;" ./package.json
RUN npm ci --ignore-scripts && npm run build

FROM registry.access.redhat.com/ubi9/nginx-120:latest
COPY default.conf "${NGINX_CONFIGURATION_PATH}"
COPY --from=builder /opt/app-root/dist .
USER 1001
CMD /usr/libexec/s2i/run

LABEL \
    com.redhat.component="Console plugin image for OpenShift Storage Scale Operator" \
    description="" \
    io.k8s.display-name="Console plugin image for OpenShift Storage Scale Operator" \
    io.k8s.description="" \
    io.openshift.tags="openshift,storage,scale" \
    distribution-scope="public" \
    name="openshift-storage-scale-console-plugin" \
    summary="Storage Scale Console Plugin" \
    release="v1.0" \
    version="v1.0" \
    maintainer="Red Hat jgil@redhat.com" \
    url="https://github.com/openshift-storage-scale/openshift-storage-scale-operator.git" \
    vendor="Red Hat, Inc." \
    License="Apache License 2.0"