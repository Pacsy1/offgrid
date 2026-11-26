# Data Offgrid sends

Offgrid has no telemetry. The server, desktop app, web app and mobile app send no product usage
events, crash reports, traces, metrics or logs to Offgrid or anyone else, and there is nothing to
turn off.

What leaves your machine is what you use:

- **Your provider.** Prompts, files and tool output go from your machine to the provider you run
  (Anthropic, OpenAI and so on), under that provider's terms.
- **Offgrid Connect.** When you use it, the relay sets up the link between your devices. It does not
  proxy your HTTP or WebSocket sessions.
- **Updates.** The desktop app checks its release feed for new versions. Preview builds have no feed
  and never check.

Logs, crash records and heap snapshots stay on the machine that wrote them. Share one only if you
choose to, for example in a GitHub issue.

## Agent activity for mobile notifications

When **Publish agent activity** is enabled on a host, it sends project and thread titles, model
names, activity status, and environment and thread identifiers to the Offgrid Connect relay for
[mobile notifications and live activities](./mobile-notifications.md). It is off until you turn
it on.

To stop publishing, turn off **Publish agent activity** under **Settings > Sharing & access** on
the host. Turning off notifications on a phone controls that phone's alerts, not the host's
publishing setting.
