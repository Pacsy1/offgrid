# Data Offgrid sends

Offgrid has no telemetry. The server, desktop app, web app and mobile app send no product usage
events, crash reports, traces, metrics or logs to Offgrid or anyone else, and there is nothing to
turn off. Offgrid also contacts nothing run by T3 Code or T3 Tools Inc.

## What leaves your machine

Every connection Offgrid makes on its own is listed here:

- **Your provider.** Prompts, files and tool output go from your machine to the provider you run
  (Anthropic, OpenAI and so on), under that provider's terms. The agent's own CLI makes these
  requests.
- **The model list.** About once an hour the server downloads `model-manifest.json` from this
  project's repository on GitHub (`raw.githubusercontent.com/Pacsy1/offgrid`), so new models show
  up without an app update. It sends nothing but the request.
- **Model prices.** To estimate usage costs, the server downloads the public LiteLLM price list
  from GitHub, at most once a day.
- **Updates.** The desktop app checks this project's GitHub releases for new versions. Preview
  builds have no feed and never check.

Everything else happens only when you use it: signing in to GitHub or another forge, cloning a
repository, installing an agent, or opening a link.

Logs, crash records and heap snapshots stay on the machine that wrote them, in
`~/.t3/userdata/logs`. Share one only if you choose to, for example in a GitHub issue.

## Offgrid Connect and hosted links are off

Offgrid runs no hosted web app, sign-in service or relay. Offgrid Connect, hosted sign-in and
`https://` thread links stay off unless whoever builds or runs your server sets their own
addresses. Copied thread and prompt links use `offgrid://` links, which open the installed app.

If you run your own relay from `infra/relay`, it exports no traces or logs; see its README.

## Agent activity for mobile notifications

When **Publish agent activity** is enabled on a host that has Offgrid Connect set up, it sends
project and thread titles, model names, activity status, and environment and thread identifiers to
that relay for [mobile notifications and live activities](./mobile-notifications.md). It is off
until you turn it on.

To stop publishing, turn off **Publish agent activity** under **Settings > Sharing & access** on
the host. Turning off notifications on a phone controls that phone's alerts, not the host's
publishing setting.

## Correction in 1.0.0

Versions up to 0.1.12 removed the analytics but still pointed at T3 Code's hosted services. The
model list was downloaded from T3 Code's repository, copied links went to `app.t3.codes`, update
and install links pointed at T3 Code's releases, and the mobile app was set up to sign in through
`clerk.t3.codes` and check T3 Code's Expo update server. None of that sent telemetry, but it
contradicted "nothing sent home." Version 1.0.0 removes all of it.
