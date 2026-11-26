import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Logger from "effect/Logger";
import * as Option from "effect/Option";

function isStructuralTag(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 128 &&
    /^[A-Za-z][A-Za-z0-9._:/-]*$/.test(value)
  );
}

export function errorTag(error: unknown): string {
  try {
    if (typeof error === "object" && error !== null && "_tag" in error) {
      return isStructuralTag(error._tag) ? error._tag : "TaggedError";
    }
    if (error instanceof Error) {
      return isStructuralTag(error.name) ? error.name : "Error";
    }
  } catch {
    return "UnknownError";
  }
  return typeof error;
}

export function causeErrorTag(cause: Cause.Cause<unknown>): string {
  const failure = Cause.findErrorOption(cause);
  if (Option.isSome(failure)) {
    return errorTag(failure.value);
  }
  return cause.reasons[0]?._tag ?? "Empty";
}

// WebSocket tickets and their DPoP proofs ride in URL queries and stay valid after the request.
const URL_CREDENTIAL_PARAMS = /(^|[?&"\s])(wsTicket|dpop)=[^&#"\\\s]*/g;

const redactUrlCredentials = (text: string) =>
  text.replace(URL_CREDENTIAL_PARAMS, "$1$2=<redacted>");

// Effect's HTTP errors, including failed upgrades, put the request URL in their message.
export function redactCauseCredentials(cause: Cause.Cause<unknown>): Cause.Cause<unknown> {
  if (cause.reasons.length === 0 || Cause.hasInterruptsOnly(cause)) {
    return cause;
  }
  const pretty = Cause.pretty(cause);
  const redacted = redactUrlCredentials(pretty);
  return redacted === pretty ? cause : Cause.die(new Error(redacted));
}

const LOCAL_LOG_FILE_MAX_BYTES = 10 * 1024 * 1024;

/**
 * Appends log lines to a file on this machine; nothing leaves it. The file
 * rotates to one `.1` backup at startup once it passes the size limit.
 */
export const localLogFileLogger = Effect.fn("localLogFileLogger")(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const size = yield* fs.stat(filePath).pipe(
    Effect.map((stat) => Number(stat.size)),
    Effect.orElseSucceed(() => 0),
  );
  if (size > LOCAL_LOG_FILE_MAX_BYTES) {
    yield* fs.rename(filePath, `${filePath}.1`).pipe(Effect.ignore);
  }
  return yield* Logger.toFile(Logger.formatLogFmt, filePath);
});
