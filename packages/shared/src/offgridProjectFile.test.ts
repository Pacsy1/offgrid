import * as Schema from "effect/Schema";
import { describe, expect, it } from "vite-plus/test";

import { parseOffgridProjectFile, OffgridProjectFileFromJson } from "./offgridProjectFile.ts";

const decodeJson = Schema.decodeUnknownSync(OffgridProjectFileFromJson);

describe("OffgridProjectFileFromJson", () => {
  it("decodes lenient JSONC with comments and trailing commas", () => {
    const decoded = decodeJson(`{
      // team scripts
      "iconPath": "assets/logo.svg",
      "scripts": [
        { "name": "Dev", "command": "pnpm dev", "stopOnSettle": true, },
      ],
    }`);

    expect(decoded.iconPath).toBe("assets/logo.svg");
    expect(decoded.scripts?.[0]).toEqual({ name: "Dev", command: "pnpm dev", stopOnSettle: true });
  });
});

describe("parseOffgridProjectFile", () => {
  it("reads project defaults from JSONC with a URL in a block comment", () => {
    expect(
      parseOffgridProjectFile(`{
        /* See https://t3.codes/schema/offgrid.json */
        "defaultThreadEnvMode": "worktree"
      }`),
    ).toEqual({ defaultThreadEnvMode: "worktree" });
  });
});
