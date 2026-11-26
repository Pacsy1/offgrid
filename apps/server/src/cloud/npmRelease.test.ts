import { expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import { HttpClient, HttpClientResponse } from "effect/http";
import * as Result from "effect/Result";
import * as TestClock from "effect/testing/TestClock";

import * as NpmRelease from "./npmRelease.ts";

const releases = [
  { tag_name: "v1.1.0-nightly.20261201.1" },
  { tag_name: "v1.0.1", draft: true },
  { tag_name: "v1.0.0" },
];

const makeService = (respond: (url: string) => Response, urls: string[] = []) =>
  NpmRelease.make().pipe(
    Effect.provideService(
      HttpClient.HttpClient,
      HttpClient.make((request) => {
        urls.push(request.url);
        return Effect.succeed(HttpClientResponse.fromWeb(request, respond(request.url)));
      }),
    ),
  );

it.effect("reads tracks and exact versions from Offgrid's GitHub releases, never npm", () =>
  Effect.gen(function* () {
    const urls: string[] = [];
    const service = yield* makeService(() => new Response(JSON.stringify(releases)), urls);
    expect(yield* service.get({ spec: "latest" })).toEqual({ version: "1.0.0" });
    expect(yield* service.get({ spec: "nightly" })).toEqual({
      version: "1.1.0-nightly.20261201.1",
    });
    expect(yield* service.get({ spec: "1.0.0" })).toEqual({ version: "1.0.0" });
    expect(yield* service.get({ spec: "1.0.1" })).toBeNull();
    expect(
      urls.every((url) => url.startsWith("https://api.github.com/repos/Pacsy1/offgrid/")),
    ).toBe(true);
  }),
);

it.effect("fails when GitHub is unreachable or stalls", () =>
  Effect.gen(function* () {
    const failing = yield* makeService(() => new Response("{}", { status: 503 }));
    expect(Result.isFailure(yield* failing.get({ spec: "latest" }).pipe(Effect.result))).toBe(true);

    const stalledService = yield* makeService(() => new Response(new ReadableStream()));
    const stalled = yield* stalledService
      .get({ spec: "latest" })
      .pipe(Effect.result, Effect.forkChild);
    yield* TestClock.adjust("15 seconds");
    expect(Result.isFailure(yield* Fiber.join(stalled))).toBe(true);
  }),
);

it.effect.each(["--registry=https://example.com", "../other", "other-package@latest", "*", ""])(
  "rejects invalid release specs before any request: %s",
  (spec) =>
    Effect.gen(function* () {
      const service = yield* makeService(() => {
        throw new Error("invalid specs must not reach GitHub");
      });
      expect(Result.isFailure(yield* service.get({ spec }).pipe(Effect.result))).toBe(true);
    }),
);
