<p align="center">
  <img src="./assets/prod/offgrid-black-web-icon-192x192.png" width="80" height="80" alt="Offgrid icon" />
</p>

<h1 align="center">Offgrid</h1>

<p align="center">One app for all your coding agents, with nothing sent home.</p>

<p align="center">
  <a href="https://github.com/Pacsy1/offgrid/releases">Download</a> ·
  <a href="./docs/README.md">Docs</a>
</p>

Offgrid gives the coding agents on your computer one fast interface. Run Claude Code, Codex, Cursor,
and others side by side, review what they change, and keep working from your phone. It does all of
this without reporting anything about you or your work to anyone.

> **Correction (1.0.0).** Versions up to 0.1.12 removed T3 Code's analytics but still pointed at
> T3 Code's hosted services: the model list came from T3 Code's repository, copied links went to
> `app.t3.codes`, update and install links pointed at T3 Code's releases, and the mobile app was set
> up to sign in through `clerk.t3.codes` and check T3 Code's update server. The relay in
> `infra/relay` also still shipped traces to Axiom. None of this was telemetry, but it contradicted
> "nothing sent home," and I should have caught it. Version 1.0.0 removes all of it, and
> [Data Offgrid sends](./docs/user/telemetry.md) now lists every connection the app makes.

## Why Offgrid

### No telemetry

Offgrid is a fork of [T3 Code](https://github.com/pingdotgg/t3code) with every telemetry path
taken out, not just turned off:

- **No usage analytics.** There is no analytics service, no install or device ID, and no record of
  which features you use or which agents you run.
- **No tracing.** Offgrid does not send traces or timing data from the app, the server, or the
  phone.
- **No crash uploads.** Crashes stay on your machine; nothing uploads stack traces or source maps.
- **No reports about your agents.** Agents are never asked to file feedback about Offgrid on your
  behalf.
- **No T3 Code servers.** Offgrid contacts nothing run by T3 Code. It runs no hosted service of its
  own either, so Offgrid Connect and hosted links stay off unless you deploy your own.

Because the code is gone rather than switched off, there is no setting to forget, no environment
variable to export, and no update that can quietly turn it back on.

On its own, Offgrid only downloads its model list from this repository, checks this repository's
releases for updates, and fetches the public LiteLLM price list to estimate usage costs. Everything
else, such as your agents talking to their providers, happens because you use it.
[Data Offgrid sends](./docs/user/telemetry.md) has the details.

### Everything T3 Code does well

Offgrid is versioned on its own, starting at 1.0.0, and carries T3 Code's features with the
telemetry stripped out:

- **Your own subscriptions.** Offgrid does not resell tokens. It drives the agents you are already
  signed in to.
- **Every agent in one place.** Claude Code, Codex, Cursor, OpenCode, Grok Build, Antigravity, Kiro,
  Pi, Muse Code, fx, and any [ACP](./docs/user/providers-acp.md) agent. Switch models in the middle
  of a thread, or let one agent hand work to another.
- **Desktop, web, and phone.** One server, and every client shows the same threads.
- **Remote ready.** Run agents on any machine and reach them over your local network or Tailscale.
- **Git built in.** Each thread can work in its own worktree. Review the diff, then commit, push,
  and open a pull request without leaving the app.
- **Fast.** Long threads, big diffs, and many agents at once stay responsive.

### Open

The source is MIT licensed and everything is in this repository. Read it, build it yourself, or fork
it.

## Install

Download the installer for your system from
[Releases](https://github.com/Pacsy1/offgrid/releases), run it, and open Offgrid.

| System                         | Install                                       |
| ------------------------------ | --------------------------------------------- |
| Windows (x64 or Arm)           | `.exe` installer                              |
| macOS (Apple Silicon or Intel) | `.dmg`                                        |
| Linux (x64 or arm64)           | `.AppImage`, `.deb`, Flatpak, or Arch package |

### Linux packages

**Arch Linux:** each release includes a `PKGBUILD` for the `offgrid-bin` package. Build and install
it with `makepkg`:

```bash
mkdir offgrid-bin && cd offgrid-bin
curl -LO https://github.com/Pacsy1/offgrid/releases/latest/download/PKGBUILD
makepkg -si
```

The package is coming to the AUR once AUR account registration reopens.

**Flatpak:** Offgrid is not on Flathub. Download the `.flatpak` file for your architecture from
[Releases](https://github.com/Pacsy1/offgrid/releases), then install it:

```bash
flatpak install --user Offgrid-*.flatpak
```

The Flatpak runs your installed agents and git on your system, so set them up as usual. Offgrid's
built-in terminal opens inside the Flatpak sandbox; use the AppImage, `.deb`, or Arch package if you
need it to run your full system shell.

Offgrid then needs one coding agent that is installed and signed in. For example, install
[Claude Code](https://claude.com/product/claude-code) and run `claude auth login`, or install
[Codex CLI](https://developers.openai.com/codex/cli) and run `codex login`.
[Provider setup](./docs/user/install.md#providers) has the steps for each agent.

### Build from source

```bash
vp i
vp run dist:desktop:win   # or dist:desktop:dmg, dist:desktop:linux
```

The installer lands in `release/`. To run the server and web app from a checkout instead, use
`vp run dev`. The [development runbook](./docs/operations/00_development.md#first-checkout) covers
setup in detail.

## Documentation

- [Install and first run](./docs/user/install.md)
- [Remote access from a phone or another machine](./docs/user/remote-access.md)
- [Permission modes](./docs/user/permission-modes.md)
- [Source control](./docs/user/source-control.md)
- [Connect outside agents over MCP](./docs/user/outside-agents.md)
- [FAQ](./docs/user/faq.md)

[All docs](./docs/README.md) has the full list.

## Community

- Follow the [Code of Conduct](./CODE_OF_CONDUCT.md).
- Report security issues privately as described in [SECURITY.md](./SECURITY.md).

## License

Offgrid's source code is licensed under the [MIT License](./LICENSE).

Offgrid is an unofficial, independent fork of T3 Code. It is not affiliated with or endorsed by
T3 Tools Inc. See [TRADEMARK.md](./TRADEMARK.md).
