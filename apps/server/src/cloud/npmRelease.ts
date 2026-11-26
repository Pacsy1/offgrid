import {
  ServerNpmReleaseError,
  ServerNpmReleaseInput,
  type ServerNpmRelease,
} from "@offgrid/contracts";
import { cliReleaseIndexPageUrl, newestCliReleaseVersion } from "@offgrid/shared/cliRelease";
import * as Cache from "effect/Cache";
import * as Context from "effect/Context";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import { FetchHttpClient, HttpClient } from "effect/http";

// Offgrid is not on npm (the `offgrid` package there belongs to someone else), so releases are read
// from this project's GitHub releases. The service keeps its npm name to match the wire contract.
const Releases = Schema.Array(
  Schema.Struct({ tag_name: Schema.String, draft: Schema.optionalKey(Schema.Boolean) }),
);
const decodeReleases = Schema.decodeUnknownOption(Schema.fromJsonString(Releases));
const decodeInput = Schema.decodeUnknownEffect(ServerNpmReleaseInput);
const MAX_RELEASE_PAGES = 3;

export class NpmRelease extends Context.Service<
  NpmRelease,
  {
    readonly get: (
      input: ServerNpmReleaseInput,
    ) => Effect.Effect<ServerNpmRelease | null, ServerNpmReleaseError>;
  }
>()("offgrid/cloud/npmRelease") {}

export const make = Effect.fn("NpmRelease.make")(function* () {
  const http = yield* HttpClient.HttpClient;
  const unreachable = new ServerNpmReleaseError({
    reason: "GitHub releases could not be reached.",
  });
  const readPage = Effect.fn("NpmRelease.readPage")(
    function* (page: number) {
      const response = yield* http
        .get(cliReleaseIndexPageUrl(page), {
          headers: { accept: "application/vnd.github+json" },
        })
        .pipe(Effect.mapError(() => unreachable));
      if (response.status < 200 || response.status >= 300) return yield* unreachable;
      const text = yield* response.text.pipe(Effect.mapError(() => unreachable));
      const releases = Option.getOrUndefined(decodeReleases(text));
      if (releases === undefined) {
        return yield* new ServerNpmReleaseError({
          reason: "GitHub returned invalid release metadata.",
        });
      }
      return releases;
    },
    Effect.timeoutOrElse({
      duration: Duration.seconds(15),
      orElse: () => Effect.fail(unreachable),
    }),
  );
  const cache = yield* Cache.make({
    capacity: 32,
    timeToLive: Duration.minutes(1),
    lookup: Effect.fn("NpmRelease.lookup")(function* (spec: string) {
      for (let page = 1; page <= MAX_RELEASE_PAGES; page += 1) {
        const releases = yield* readPage(page);
        const version =
          spec === "latest" || spec === "nightly"
            ? newestCliReleaseVersion(releases, spec === "nightly" ? "nightly" : "stable")
            : releases.some((release) => !release.draft && release.tag_name === `v${spec}`)
              ? spec
              : undefined;
        if (version !== undefined) return { version } satisfies ServerNpmRelease;
        if (releases.length < 100) break;
      }
      return null;
    }),
  });
  return NpmRelease.of({
    get: Effect.fn("NpmRelease.get")(function* (input) {
      const { spec } = yield* decodeInput(input).pipe(
        Effect.mapError(
          () => new ServerNpmReleaseError({ reason: "Invalid release version or track." }),
        ),
      );
      return yield* Cache.get(cache, spec);
    }),
  });
});

export const layer = Layer.effect(NpmRelease, make()).pipe(Layer.provide(FetchHttpClient.layer));
