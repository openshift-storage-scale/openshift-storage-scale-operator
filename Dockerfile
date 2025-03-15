FROM registry.redhat.io/ubi9/go-toolset@sha256:6402ad7886fb3bdaa950c89bdf338f8dbedde54c16bddb1157ebb8691b2def50 AS builder
ARG TARGETOS
ARG TARGETARCH

USER 0
# Build the manager binary

WORKDIR /workspace

# Copy the go source
COPY go.mod go.mod
COPY go.sum go.sum

# Ensure correct Go version

# Copy the go source
COPY vendor/ vendor/
COPY cmd/main.go cmd/main.go
COPY api/ api/
COPY internal/ internal/
COPY files/ /files/
COPY hack/ hack/
COPY version/ version/
COPY assets assets/
# Needed to get the git versions in there
COPY .git/ .git/
RUN mkdir /licenses
COPY LICENSE /licenses

# Build
RUN --mount=type=secret,id=pull hack/build.sh

# UBI is larger (158Mb vs. 56Mb) but approved by RH
FROM registry.access.redhat.com/ubi9/ubi-minimal:latest
WORKDIR /
COPY --from=builder /files/ /files/
COPY --from=builder /workspace/manager .
COPY --from=builder /licenses/ /licenses/
USER 65532:65532

ENTRYPOINT ["/manager"]
