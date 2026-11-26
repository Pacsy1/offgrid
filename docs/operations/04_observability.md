# Observability

> For maintainers. Using Offgrid? See [docs/user](../user/).

Offgrid keeps diagnostics on the machine that produced them. Nothing is exported: there is no
OTLP, trace file or analytics endpoint. See [Data Offgrid sends](../user/telemetry.md).

## Logs

- The server logs to stdout with `Logger.consolePretty()`. Normal local launches do not write a
  server log file.
- SSH-managed launches persist the remote process's stdout and stderr at
  `~/.t3/ssh-launch/<state>/server.log`. Each launch starts that file empty.
- The desktop app writes its backend child's output to `server-child.log` in its logs dir, and only
  when the backend fails, so normal runs leave it empty.
- Provider event NDJSON files record provider runtime streams.

## Event loop stalls

`apps/server/src/observability/EventLoopMonitor.ts` samples the event loop every 30 s and logs a
warning when it stalled for more than 2 s since the previous sample. The first sample after launch
is skipped, because startup work such as migrations can block the loop for seconds on a large
database. Time the computer spends asleep can read as a stall on macOS and Windows; the warning's
CPU time far below the delay shows that case.

## Heap Snapshots

To see what a long-running server holds in memory, send it `SIGUSR2`. The server writes a V8 heap
snapshot to its logs dir and logs the path. This works for desktop, `npx offgrid`, and service installs
on macOS and Linux. Windows has no `SIGUSR2`.

Send the signal to the server pid in `server-runtime.json`, which sits in the server's state dir
next to the `logs` dir. For a dev server or a `--home-dir` launch, use that server's own state dir. Do not send it to the desktop app or the service launcher: a process without the
handler exits on `SIGUSR2`. After a crash the file can keep a stale pid that now belongs to a
different process, so check the pid first.

```bash
pid="$(jq .pid "${OFFGRID_HOME:-$HOME/.t3}/userdata/server-runtime.json")"
ps -p "$pid" -o command=
```

If `ps` shows the Offgrid server, send the signal:

```bash
kill -USR2 "$pid"
```

The file is `<logsDir>/server-<pid>-<timestamp>.heapsnapshot`. To
open it, use the Memory tab in Chrome DevTools and select Load.

Before you take one:

- The server stops while it writes the file. For a large heap this can take a minute or more.
  Connected clients can reconnect during the pause, and an event loop monitor, if the server has
  one, records the pause as a stall. Send the signal once. A second signal sent during a write
  takes another snapshot after the first one finishes.
- The write needs about as much free memory as the heap uses. On a machine that is already
  swapping, it can make the problem worse or crash the server.
- The file contains everything in server memory, including tokens, secrets, and thread content. Do
  not share it publicly. Delete it when you are done, because storage cleanup does not remove it.
