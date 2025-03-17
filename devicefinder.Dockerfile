ARG TARGETARCH=amd64
ARG TARGETOS=linux
FROM --platform=$TARGETOS/$TARGETARCH brew.registry.redhat.io/rh-osbs/openshift-golang-builder:v1.23 AS builder

WORKDIR /workspace
COPY . .

RUN make build-devicefinder

FROM registry.redhat.io/rhel9/support-tools@sha256:0edcb9a34e61644d8039f55d077ccea8cb7c7141f1fcc16f9138e6d79a9ecd83

COPY --from=builder /workspace/_output/bin/devicefinder /usr/bin/

ENTRYPOINT ["/usr/bin/devicefinder"]
