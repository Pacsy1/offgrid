import * as NodePath from "@effect/platform-node/NodePath";
import { assert, describe, it } from "@effect/vitest";
import * as NodeOS from "node:os";
import * as NodeUtil from "node:util";

import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Redactable from "effect/Redactable";
import * as Path from "effect/Path";
import * as HttpClient from "effect/http/HttpClient";
import * as HttpClientResponse from "effect/http/HttpClientResponse";

import * as ServerConfig from "./config.ts";
import * as ServerLogger from "./serverLogger.ts";

interface ExportedRequest {
  readonly url: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: string;
}

const layerCollector = (requests: Array<ExportedRequest>) =>
  Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make((request) =>
      Effect.sync(() => {
        requests.push({
          url: request.url,
          headers: request.headers,
          body:
            request.body._tag === "Uint8Array" ? new TextDecoder().decode(request.body.body) : "",
        });
        return HttpClientResponse.fromWeb(request, new Response(null, { status: 200 }));
      }),
    ),
  );

const layerConfig = (overrides: Partial<ServerConfig.ServerConfig["Service"]>) =>
  Layer.effect(
    ServerConfig.ServerConfig,
    Effect.gen(function* () {
      const path = yield* Path.Path;
      const baseDir = path.join(NodeOS.tmpdir(), "offgrid-server-logger-test");
      const derivedPaths = yield* ServerConfig.deriveServerPaths(baseDir, undefined);
      return ServerConfig.make({
        logLevel: "Info",
        cwd: baseDir,
        baseDir,
        ...derivedPaths,
        mode: "web",
        autoBootstrapProjectFromCwd: false,
        logWebSocketEvents: false,
        tailscaleServeEnabled: false,
        tailscaleServePort: 443,
        port: 0,
        host: undefined,
        desktopBootstrapToken: undefined,
        desktopChannelFd: undefined,
        desktopChannelControlFd: undefined,
        staticDir: undefined,
        devUrl: undefined,
        devAllowedOrigins: [],
        noBrowser: false,
        startupPresentation: "browser",
        ...overrides,
      });
    }),
  ).pipe(Layer.provide(NodePath.layer));

const printThroughConsole = (fields: object) =>
  Effect.gen(function* () {
    const printed: Array<string> = [];
    const testConsole = {
      ...globalThis.console,
      log: (...args: ReadonlyArray<unknown>) => {
        printed.push(NodeUtil.format(...args));
      },
    } satisfies Console.Console;
    yield* Effect.logWarning("pull request watch check failed", fields).pipe(
      Effect.provide(
        ServerLogger.layer.pipe(
          Layer.provide(layerConfig({})),
          Layer.provide(layerCollector([])),
          Layer.provide(layerNoLogFile),
        ),
      ),
      Effect.provideService(Console.Console, testConsole),
    );
    return printed.join("\n");
  });

// The noop file system fails to open the log file, so the logger stays console-only.
const layerNoLogFile = Layer.merge(FileSystem.layerNoop({}), Path.layer);

describe("ServerLoggerLive", () => {
  it.effect("prints a cause passed as a log field instead of collapsing it", () =>
    Effect.gen(function* () {
      const output = yield* printThroughConsole({
        threadId: "thread-1",
        cause: Cause.fail(new Error("gh: HTTP 502 from api.github.com")),
      });

      assert.include(output, "threadId: 'thread-1'");
      assert.include(output, "gh: HTTP 502 from api.github.com");
      assert.notInclude(output, "[Object]");
    }),
  );

  // regression: #16642 logs printed causes as [Object]
  it.effect("leaves getters uncalled while printing a cause field", () =>
    Effect.gen(function* () {
      const output = yield* printThroughConsole({
        cause: Cause.fail(new Error("upstream refused")),
        get detail(): string {
          throw new Error("getter must not run");
        },
      });

      assert.include(output, "upstream refused");
      assert.notInclude(output, "getter must not run");
    }),
  );

  it.effect("leaves a message with its own redaction hook to that hook", () =>
    Effect.gen(function* () {
      const output = yield* printThroughConsole({
        token: "secret-token-value",
        cause: Cause.fail(new Error("upstream refused")),
        [Redactable.symbolRedactable](this: { readonly cause: unknown }) {
          return { token: "<redacted>", cause: Cause.isCause(this.cause) ? "cause" : "missing" };
        },
      });

      assert.include(output, "token: '<redacted>'");
      assert.include(output, "cause: 'cause'");
      assert.notInclude(output, "secret-token-value");
    }),
  );
});
