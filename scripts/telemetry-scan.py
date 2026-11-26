#!/usr/bin/env python3
"""Flag upstream commits (one per squash-merged PR) that add or touch telemetry.

Reads one `git log -p` stream, so a range of thousands of commits scans in seconds.

  py scripts/telemetry-scan.py --repo <upstream-clone> <last-synced-sha>..origin/main
  py scripts/telemetry-scan.py --repo <upstream-clone> --fork . <range> --min-level medium
  py scripts/telemetry-scan.py --repo <upstream-clone> <range> --json > hits.json

Score per commit = sum of rule weights. Added lines count fully, removed lines at half
(editing existing telemetry still conflicts with a fork that deleted it).
Exit code is 1 when any commit reaches --fail-level (default: high), else 0.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from dataclasses import dataclass, field

# (name, weight, regex) matched against diff line content.
CONTENT_RULES: list[tuple[str, float, re.Pattern[str]]] = [
    (name, weight, re.compile(pattern, flags))
    for name, weight, pattern, flags in [
        ("telemetry", 3, r"telemetry", re.I),
        ("vendor-sdk", 4, r"posthog|@sentry/|\bsentry\b|amplitude|mixpanel|segment\.(io|com)|datadog|honeycomb|\baxiom\b|bugsnag|crashlytics|rudderstack|plausible|heap\.io|logrocket|fullstory", re.I),
        ("opentelemetry", 3, r"opentelemetry|\botlp|OTEL_|otelEnvironment|traceparent", re.I),
        ("analytics", 3, r"analytics", re.I),
        ("metrics-backend", 2, r"\bMetric\.(counter|gauge|histogram|frequency|summary|timer)\b|metricsBackend|ServerMetrics|FleetMetrics|MetricsError", 0),
        ("trace-export", 2.5, r"relayTracing|RelayClientTracing|TraceDiagnostics|BrowserTraceCollector|FeedbackTrace|traceRelayRequest|HeapAttribution", 0),
        ("observability", 1.5, r"observability", re.I),
        ("feedback-upload", 2, r"FeedbackService|FeedbackStore|FeedbackReport|scrubFeedback|AgentFeedback", 0),
        ("crash-report", 2, r"crashReporter|crash[-_ ]?report", re.I),
    ]
]

PATH_RULES: list[tuple[str, float, re.Pattern[str]]] = [
    ("telemetry-path", 4, re.compile(r"telemetry", re.I)),
    ("observability-path", 3, re.compile(r"(^|/)observability/|otlp|opentelemetry", re.I)),
    ("feedback-path", 2, re.compile(r"(^|/)feedback/", re.I)),
    ("diagnostics-path", 1.5, re.compile(r"(^|/)diagnostics/", re.I)),
    ("privacy-policy", 1, re.compile(r"privacy", re.I)),
]

# Lines added to a package manifest that pull in a telemetry SDK.
DEPENDENCY_RULE = re.compile(
    r'"(@opentelemetry/[^"]+|@effect/opentelemetry|posthog[^"]*|@sentry/[^"]+|@amplitude/[^"]+|mixpanel[^"]*|@segment/[^"]+|dd-trace|@datadog/[^"]+|@bugsnag/[^"]+|@vercel/analytics|@react-native-firebase/(analytics|crashlytics))"\s*:'
)

URL_RULE = re.compile(r"https?://([a-z0-9.-]+\.[a-z]{2,})", re.I)
BENIGN_HOSTS = re.compile(
    r"(^|\.)(localhost|example\.(com|org)|github\.com|githubusercontent\.com|t3\.codes|"
    r"npmjs\.(com|org)|nodejs\.org|mozilla\.org|w3\.org|schema\.org|json-schema\.org|"
    r"apple\.com|android\.com|expo\.dev|microsoft\.com|openai\.com|anthropic\.com|claude\.(ai|com))$",
    re.I,
)

SKIP_PATHS = re.compile(r"(^|/)(pnpm-lock\.yaml|\.repos/|third-party-licenses/|node_modules/)")
DOC_PATHS = re.compile(r"\.(md|mdx)$|(^|/)docs/")
TEST_PATHS = re.compile(r"\.test\.[cm]?[jt]sx?$|(^|/)(test|tests|__tests__|testkit)/")

LEVELS = {"low": 2, "medium": 5, "high": 10}
RULE_CAP = 15
COMMIT_MARK = "\x1ecommit\x1f"


@dataclass
class Hit:
    rule: str
    path: str
    line: str


@dataclass
class Commit:
    sha: str
    date: str
    subject: str
    hits: list[Hit] = field(default_factory=list)
    files: set[str] = field(default_factory=set)
    rules: dict[str, float] = field(default_factory=dict)

    def add(self, rule: str, weight: float, path: str, line: str) -> None:
        self.rules[rule] = self.rules.get(rule, 0) + weight
        if len(self.hits) < 200:
            self.hits.append(Hit(rule, path, line.strip()[:160]))

    @property
    def pr(self) -> str | None:
        m = re.search(r"\(#(\d+)\)\s*$", self.subject)
        return m.group(1) if m else None

    @property
    def score(self) -> float:
        # Cap each rule so one noisy commit can't swamp the ranking. Edits to files the fork
        # deleted only count alongside a telemetry signal; the fork deletes other things too.
        core = sum(min(v, RULE_CAP) for k, v in self.rules.items() if k != "stripped-in-fork")
        if core == 0:
            return 0.0
        return core + min(self.rules.get("stripped-in-fork", 0), 6)

    @property
    def level(self) -> str:
        for name in ("high", "medium", "low"):
            if self.score >= LEVELS[name]:
                return name
        return "none"


def prefetch_blobs(repo: str, revs: list[str]) -> None:
    """A blob-less clone fetches each missing blob lazily during `git log -p`; batch it instead."""
    git = ["git", "-C", repo]
    promisor = subprocess.run(
        [*git, "config", "--get-regexp", r"remote\..*\.promisor"], capture_output=True, text=True
    )
    if "true" not in promisor.stdout:
        return
    listed = subprocess.run(
        [*git, "rev-list", "--objects", "--missing=print", *revs],
        capture_output=True, text=True, check=True,
    ).stdout
    missing = [l[1:] for l in listed.splitlines() if l.startswith("?")]
    if not missing:
        return
    print(f"Prefetching {len(missing)} missing blobs...", file=sys.stderr)
    subprocess.run(
        [*git, "-c", "fetch.negotiationAlgorithm=noop", "fetch", "origin", "--no-tags",
         "--no-write-fetch-head", "--recurse-submodules=no", "--filter=blob:none", "--stdin"],
        input="\n".join(missing), text=True, check=True,
    )


def scan(repo: str, revs: list[str], fork: str | None, paths: list[str]) -> list[Commit]:
    cmd = [
        "git", "-C", repo, "log", "--no-color", "--no-merges", "--no-renames", "-p", "-U0",
        f"--format={COMMIT_MARK}%H\x1f%ad\x1f%s", "--date=short", *revs,
    ]
    if paths:
        cmd += ["--", *paths]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, encoding="utf-8", errors="replace")
    assert proc.stdout is not None

    commits: list[Commit] = []
    cur: Commit | None = None
    path = ""
    skip = False
    is_new_file = False
    # Per (commit, path, rule) cap so a giant generated file can't dominate the score.
    seen: dict[tuple[str, str], int] = {}

    for raw in proc.stdout:
        line = raw.rstrip("\n")
        if line.startswith(COMMIT_MARK):
            sha, date, subject = line[len(COMMIT_MARK):].split("\x1f", 2)
            cur = Commit(sha, date, subject)
            commits.append(cur)
            seen.clear()
            continue
        if cur is None:
            continue
        if line.startswith("diff --git "):
            m = re.match(r"diff --git a/(.*) b/(.*)$", line)
            path = m.group(2) if m else ""
            skip = bool(SKIP_PATHS.search(path))
            is_new_file = False
            if not skip:
                cur.files.add(path)
                for rule, weight, rx in PATH_RULES:
                    if rx.search(path):
                        cur.add(rule, weight, path, "(path)")
            continue
        if skip:
            continue
        if line.startswith("new file mode"):
            is_new_file = True
            continue
        if line.startswith("--- ") or line.startswith("+++ "):
            if line.startswith("--- a/") and fork and not is_new_file:
                if not os.path.exists(os.path.join(fork, path)):
                    cur.add("stripped-in-fork", 2, path, "(file missing in fork)")
            continue
        if not line or line[0] not in "+-":
            continue

        if len(line) > 400:
            continue  # minified or bundled code (e.g. dependency patches) mentions everything
        added = line[0] == "+"
        body = line[1:]
        factor = 1.0 if added else 0.5
        if DOC_PATHS.search(path) or TEST_PATHS.search(path):
            factor *= 0.4

        if added and path.endswith("package.json"):
            dep = DEPENDENCY_RULE.search(body)
            if dep:
                cur.add("telemetry-dependency", 6, path, body)

        for rule, weight, rx in CONTENT_RULES:
            if rx.search(body):
                key = (path, rule)
                n = seen.get(key, 0)
                seen[key] = n + 1
                if n < 5:
                    cur.add(rule, weight * factor, path, ("+" if added else "-") + body)

        if added and not TEST_PATHS.search(path) and not DOC_PATHS.search(path):
            for host in URL_RULE.findall(body):
                if not BENIGN_HOSTS.search(host):
                    key = (path, "host:" + host)
                    if key not in seen:
                        seen[key] = 1
                        cur.add("new-external-host", 1, path, host)

    proc.wait()
    if proc.returncode != 0:
        sys.exit(f"git log failed with exit code {proc.returncode}")
    return commits


def origin_url(repo: str) -> str | None:
    out = subprocess.run(
        ["git", "-C", repo, "remote", "get-url", "origin"], capture_output=True, text=True
    ).stdout.strip()
    m = re.match(r"(?:https://github\.com/|git@github\.com:)(.+?)(?:\.git)?$", out)
    return f"https://github.com/{m.group(1)}" if m else None


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("revs", nargs="+", help="git revision range(s), e.g. <last-sync>..origin/main")
    ap.add_argument("--repo", default=".", help="upstream clone to scan (default: cwd)")
    ap.add_argument("--fork", help="fork checkout; flags edits to files the fork has deleted")
    ap.add_argument("--path", action="append", default=[], help="limit to a pathspec (repeatable)")
    ap.add_argument("--min-level", choices=list(LEVELS), default="low")
    ap.add_argument("--fail-level", choices=[*LEVELS, "never"], default="high")
    ap.add_argument("--details", type=int, default=4, help="evidence lines per commit (0 hides)")
    ap.add_argument("--no-prefetch", action="store_true", help="skip the batch blob fetch for partial clones")
    ap.add_argument("--json", action="store_true", help="print JSON instead of a report")
    args = ap.parse_args()

    if not args.no_prefetch:
        prefetch_blobs(args.repo, args.revs)
    commits = scan(args.repo, args.revs, args.fork, args.path)
    flagged = sorted(
        (c for c in commits if c.score >= LEVELS[args.min_level]), key=lambda c: -c.score
    )
    base = origin_url(args.repo)

    if args.json:
        json.dump(
            [
                {
                    "sha": c.sha, "date": c.date, "subject": c.subject, "pr": c.pr,
                    "url": f"{base}/pull/{c.pr}" if base and c.pr else None,
                    "score": round(c.score, 1), "level": c.level,
                    "rules": {k: round(v, 1) for k, v in sorted(c.rules.items(), key=lambda kv: -kv[1])},
                    "hits": [h.__dict__ for h in c.hits],
                }
                for c in flagged
            ],
            sys.stdout, indent=2,
        )
        print()
    else:
        counts = {lvl: sum(1 for c in flagged if c.level == lvl) for lvl in ("high", "medium", "low")}
        print(f"Scanned {len(commits)} commits: {counts['high']} high, {counts['medium']} medium, {counts['low']} low\n")
        for c in flagged:
            top = ", ".join(f"{k} {v:.0f}" for k, v in sorted(c.rules.items(), key=lambda kv: -kv[1])[:4])
            print(f"[{c.level.upper():6}] {c.score:6.1f}  {c.sha[:10]}  {c.date}  {c.subject}")
            if base and c.pr:
                print(f"         {base}/pull/{c.pr}")
            print(f"         {top}")
            shown: set[tuple[str, str]] = set()
            for h in sorted(c.hits, key=lambda h: h.rule == "stripped-in-fork"):
                if len(shown) >= args.details:
                    break
                if (h.path, h.rule) in shown:
                    continue
                shown.add((h.path, h.rule))
                print(f"           {h.rule:20} {h.path}: {h.line}")
            print()

    if args.fail_level != "never" and any(c.score >= LEVELS[args.fail_level] for c in commits):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
