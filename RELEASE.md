# Release new version steps

This is totally temporary for now. We'll automate this later

1. Change VERSION in `_VERSION` file
2. Run `./scripts/release.sh`
exit 0 for now
3. `export NEW_VERSION=$(grep -e "^VERSION ?=" Makefile | awk '{ print $3 }')`
4. Run `git commit -a -m "Release new version ${NEW_VERSION}"`
5. Run `git tag v${NEW_VERSION}; git push origin v${NEW_VERSION}`
