#!/bin/sh
# Offgrid drives coding agents and git that are installed on the host, which the sandbox cannot
# see. Each tool found on the host gets a link to host-command, which runs it there.
shim_dir="${XDG_RUNTIME_DIR:-/tmp}/app/${FLATPAK_ID:-io.github.pacsy1.Offgrid}/host-bin"
rm -rf "$shim_dir"
mkdir -p "$shim_dir"

tools='claude codex opencode grok pi kiro-cli kiro muse fx agy antigravity gemini cursor-agent
git gh glab ssh node npm npx pnpm bun deno uv python3 docker'
# A login shell, so tools that only the user's profile puts on PATH are found too.
found="$(flatpak-spawn --host sh -lc 'for tool in "$@"; do command -v "$tool" >/dev/null 2>&1 && echo "$tool"; done' sh $tools 2>/dev/null)"
for tool in $found; do
  ln -s /app/libexec/host-command "$shim_dir/$tool"
done

export PATH="$shim_dir:$PATH"
exec zypak-wrapper /app/offgrid/offgrid "$@"
