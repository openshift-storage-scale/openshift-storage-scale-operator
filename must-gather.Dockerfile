FROM registry.redhat.io/openshift4/ose-must-gather-rhel9:v4.18@sha256:b998280f8963abe163c0f74fcd9f56031350e8c0ee5ec05dc8aa2290ec26f0a4 AS builder

FROM registry.redhat.io/ubi9-minimal@sha256:ac61c96b93894b9169221e87718733354dd3765dd4a62b275893c7ff0d876869

#RUN microdnf install tar rsync

# Copy must-gather required binaries
COPY --from=builder /usr/bin/oc /usr/bin/oc

# Copy our scripts
#COPY collection-scripts/* /usr/bin/

ENTRYPOINT /usr/bin/gather