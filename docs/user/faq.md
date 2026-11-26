# FAQ

## Is Offgrid a harness?

No. A harness is what turns an LLM into an agent: it gives the model tools, a way to call them, runs them, and hands the results back. Claude Code is kind of a harness. It is an interface (the TUI, the Code tab in the desktop app) plus a harness underneath (the Anthropic Agent SDK). Codex is the same split: the app plus the Codex App Server. Offgrid uses those harnesses. It is not a harness, and it does not work without one.

Chef = LLM. Kitchen = harness. Offgrid = the restaurant that lets you bring whatever kitchen you want. Our MCP is a cookbook we hand the kitchen, but the chef won't open it unless you tell them to :) I wrote the long version here: [What is a harness?](https://t3.gg/blog/post/what-is-a-harness)

Bring your own: Claude Code, Codex, Cursor, Grok Build, OpenCode, Google Antigravity, Kiro, Pi, Muse Code, or fx. [Provider setup](./install.md#providers)

## Why use Offgrid instead of Claude Code or the Codex app?

We were inspired by the Codex desktop app, Conductor, Claude Desktop, and Cursor Glass, but none met our bar. What you get:

- Bring your own sub. Claude, Codex, and whatever else you already have installed.
- Best in class remote. Run `offgrid up` on any box and drive it from anywhere.
- Best in class mobile app.
- Truly 100% open source code (MIT). If we go the wrong direction, fork it under your own branding.

Every harness feels nearly identical in here, so you can stop worrying about harnesses and focus on building :) [Install](./install.md)

## Can I use Offgrid with my Claude Code subscription?

Yes.

## How much does Offgrid cost?

Nothing. There's no way to pay us to use Offgrid. You bring your own sub. The source code is free and open source (MIT). You still pay your provider like you already do. Offgrid Connect is free too, for now. Every account can connect up to 3 machines running Offgrid. Phones and browsers that connect to them do not count. Need more? Link a paid T3 Chat account. [More machines](#can-i-connect-more-than-3-machines-with-offgrid-connect) We don't want to charge for this, but if the bill gets unacceptable we may have to change course. If you hit limits or have issues, you can always fork the source code (under your own branding), self host, or use Tailscale. [Install](./install.md)

## Can I fork or redistribute Offgrid?

Yes. Offgrid's source code is MIT licensed, so you can fork, modify, and redistribute it. Keep the copyright notices in [LICENSE](../../LICENSE), and give your fork its own name and icons so people can tell the projects apart. See [TRADEMARK.md](../../TRADEMARK.md).

## Can I connect more than 3 machines with Offgrid Connect?

Yes. Link your T3 Chat account and Offgrid Connect raises your limit: up to 10 machines with T3 Chat Pro, or 100 with Premier. Open your account menu in Offgrid, go to **T3 Chat**, and select **Link T3 Chat**. Sign in to T3 Chat and approve. The free T3 Chat plan keeps the normal limit of 3. [More machines with T3 Chat](./remote-access.md#more-machines-with-t3-chat)

## Why is my Claude 5-hour limit draining so fast?

It shouldn't anymore. Offgrid drives Claude through Anthropic's Agent SDK, and Anthropic's 5h meter used to charge Agent SDK usage about 1.7x more than using Claude Code directly. Weekly limits were never affected. Since v0.1.7, Claude in Offgrid drains your 5h limit at the same rate as Claude Code. Still seeing it? [Update Offgrid](./updating.md) on the machine that runs your agents. [My post on it](https://x.com/theo/status/2114166439813017873) · [Tracking issue](https://github.com/pingdotgg/t3code/issues/24649)

## How do I use Offgrid remotely?

Your agents run wherever Offgrid runs: your desktop, a server, a VPS. You connect to it from anywhere. I do this constantly. Less than 5% of my prompts run on my laptop. Run `offgrid up` on that machine and you get really good remote support. Pair over your local network or Tailscale, and open the server's address in a browser to use the web client. Offgrid runs no hosted service, so Offgrid Connect needs a relay you deploy yourself. [Remote access](./remote-access.md)

## How do I use Offgrid on my phone?

Offgrid has no app in the App Store or Google Play yet. You can build the mobile app from `apps/mobile` and connect it to your computer with a pairing link. The phone is a remote. Your computer does the work and needs to stay on. [Mobile setup](./install.md#mobile-app) · [Remote access](./remote-access.md)

## Why does Offgrid Connect keep disconnecting?

Offgrid Connect is our built-in alternative to Tailscale for remote connections. If it keeps dropping, open **Settings > Environments**, find the machine, and select **Details**. The first part marked as failed is the cause. I will not be disappointed if you set up Tailscale as a fallback (I do this personally). [Offgrid Connect troubleshooting](./offgrid-connect-troubleshooting.md)

## Will I get banned for using my subscription?

No. We work with all of the labs and Offgrid is within the TOS of Claude Code, Codex, and Google Antigravity. We worked directly with [SpaceXAI](https://x.com/SpaceXSI/status/2070195830192320600) to collaborate on the Grok Build and Cursor integrations. Everything else uses official ACP bindings.

If it works in Offgrid, you can trust it is safe.

## Can I add a bunch of accounts for one provider?

I don't think Offgrid is the right place to manage a pile of accounts. If we add an auto-switcher, we are risking TOS bans for our users.

A separate work account is fine. Setup for two: [Codex](./providers-codex.md#use-multiple-accounts) · [Claude](./providers-claude.md#separate-accounts-or-configurations). For a bigger pool, manage them outside Offgrid with a self-hosted proxy like [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI). I walked through how I use 6 Claude subs and 3 Codex subs in [this video](https://www.youtube.com/watch?v=D8PikZ1KhUo), and wrote up the setup in [this guide](https://gist.github.com/t3dotgg/59a521d2ee8d70aaf90e280c175072af). Hand it to your agent and it will walk you through it. Early apologies if it gets you banned 💀 After you set up a hub, Offgrid can show its pooled limits under Usage. [Connect a hub](./usage.md#connect-a-cliproxyapi-hub)

## Can I use an API key or OpenRouter instead of a subscription?

Yes. Add another provider instance in Settings and give it its own keys and endpoint. Claude has a full OpenRouter recipe. Your subscription setup stays untouched. [OpenRouter](./providers-claude.md#openrouter) · [Provider instances](./install.md#providers)

## Does Offgrid support local models?

No. Offgrid is a serious developer tool. Locally runnable models are not capable of meaningful engineering work.

## Does my code go to Offgrid servers?

No. There are no Offgrid servers. Your code and prompts go from your machine to your provider (Anthropic, OpenAI, etc.). Offgrid sends no telemetry of any kind and contacts nothing run by T3 Code. [Data Offgrid sends](./telemetry.md)

## Worktrees are eating my disk. How do I clean them up?

Open **Settings → Worktrees → Cleanup** and turn on automatic worktree cleanup. You can also run it now from there. Worktrees add up fast. One user cleared 500 GB. [Storage cleanup](./project-settings.md#storage-cleanup)

## Is there voice input?

Yes. On iPhone and Android, dictation uses on-device speech by default, with the option to use a paired environment. On macOS 26 or later, desktop users can choose Apple Speech directly under **On this Mac** or choose an environment. Web and other desktop users can enable dictation by choosing an environment. The transcript goes into your draft for review. See [Voice input](./voice-input.md).

## Does it work on Windows, Mac, and Linux?

Yes, all three. Desktop app, CLI, the works. One catch: there is no `offgrid` binary for Intel Macs, so use the desktop app there. Windows folks can also run agents inside WSL. [Install](./install.md)

## Why is my provider not showing up?

Almost always, the CLI is not installed or not on the `PATH` of the machine that runs the server. (Not your phone. The computer.) Log in on that machine first, like `codex login` or `claude auth login`. Still missing? Point **Binary path** at it in provider settings. Version managers love to cause this one. [Provider setup](./install.md#providers)
