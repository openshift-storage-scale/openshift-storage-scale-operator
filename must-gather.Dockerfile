FROM quay.io/openshift/origin-must-gather:4.18.0 AS builder

FROM registry.redhat.io/ubi9-minimal@sha256:ac61c96b93894b9169221e87718733354dd3765dd4a62b275893c7ff0d876869

#RUN microdnf install tar rsync

# Copy must-gather required binaries
COPY --from=builder /usr/bin/oc /usr/bin/oc

# Copy our scripts
#COPY collection-scripts/* /usr/bin/

ENTRYPOINT /usr/bin/gather