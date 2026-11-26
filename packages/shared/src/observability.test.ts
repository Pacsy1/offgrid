import { assert, describe, it } from "@effect/vitest";
import * as Cause from "effect/Cause";

import { causeErrorTag, errorTag, redactCauseCredentials } from "./observability.ts";

describe("errorTag", () => {
  it("reports structural tags without retaining arbitrary values", () => {
    assert.equal(errorTag({ _tag: "AcpRequestError" }), "AcpRequestError");
    assert.equal(errorTag(new TypeError("secret-token-value")), "TypeError");
    assert.equal(errorTag({ _tag: "secret token value" }), "TaggedError");
  });
});

describe("causeErrorTag", () => {
  it("reports the tagged failure value instead of the Cause reason wrapper", () => {
    assert.equal(
      causeErrorTag(Cause.fail({ _tag: "ServerAuthInvalidCredentialError" })),
      "ServerAuthInvalidCredentialError",
    );
  });
});

describe("redactCauseCredentials", () => {
  it("redacts WebSocket tickets and DPoP proofs from a failure's message", () => {
    const cause = Cause.die(new Error("GET /ws?wsTicket=ticket-secret&dpop=proof-secret failed"));
    const pretty = Cause.pretty(redactCauseCredentials(cause));
    assert.include(pretty, "wsTicket=<redacted>&dpop=<redacted>");
    assert.notInclude(pretty, "ticket-secret");
    assert.notInclude(pretty, "proof-secret");
  });
});
