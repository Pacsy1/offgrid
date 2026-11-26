# AUR packaging

This directory maintains the [`offgrid-bin`](https://aur.archlinux.org/packages/offgrid-bin)
package, which repackages the x86_64 and ARM64 AppImages from
[GitHub Releases](https://github.com/Pacsy1/offgrid/releases).

## Publishing

The release workflow calls `.github/workflows/publish-aur.yml` after it attaches the installers to
a release, and the workflow can also be run by hand for a tag. It updates the package version and
both architectures' asset names and checksums, builds the package, regenerates `.SRCINFO`, and
pushes it to the AUR.

Publishing needs the `AUR_SSH_PRIVATE_KEY` repository secret: the private half of an SSH key added
to the maintainer's AUR account. Without it, the workflow builds and checks the package but does not
publish it.

To validate a release on Arch Linux:

```bash
sudo pacman -Syu --needed base-devel github-cli jq namcap
GH_TOKEN=$(gh auth token) RELEASE_TAG=v0.1.12 \
  packaging/aur/scripts/release.sh
```
