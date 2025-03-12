# Release new version steps

This is totally temporary for now. We'll automate this later

1. Change VERSION in `Makefile`
2. Run `make bundle generate manifests docker-build docker-push bundle-build bundle-push catalog-build catalog-push`
3. `export NEW_VERSION=$(grep -e "^VERSION ?=" Makefile | awk '{ print $3 }')`
4. Run `git commit -a -m "Release new version ${NEW_VERSION}"`
5. Run `git tag v${NEW_VERSION}; git push origin v${NEW_VERSION}`
6. Tag new catalog:
   `podman tag quay.io/openshift-storage-scale/openshift-storage-scale-operator-catalog:v0.0.4 quay.io/openshift-storage-scale/openshift-storage-scale-operator-catalog:latest`
7. Push new latest catalog:
   `podman push quay.io/openshift-storage-scale/openshift-storage-scale-operator-catalog:latest`
