#!/bin/bash
# Runs the tool this link is named after on the host, in the same folder and with the same
# environment, through a login shell so the user's PATH applies.
tool="$(basename "$0")"
args=(--host --watch-bus "--directory=$PWD")
while IFS='=' read -r -d '' key value; do
  # Sandbox-only values that would point the host tool at paths inside the Flatpak.
  case "$key" in
    PATH | LD_LIBRARY_PATH | LD_PRELOAD | XDG_* | FLATPAK_* | ZYPAK_* | container | TMPDIR) continue ;;
  esac
  args+=("--env=$key=$value")
done < <(env -0)
exec flatpak-spawn "${args[@]}" sh -lc 'exec "$@"' sh "$tool" "$@"
