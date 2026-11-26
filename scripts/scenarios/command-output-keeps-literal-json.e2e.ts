import { expect } from "e2e";

import { test, WEB } from "./offgrid.ts";

test(
  "An expanded command shows the JSON line it printed, keys and all",
  WEB,
  async ({ offgrid, app, screen }) => {
    const project = await offgrid.project("demo");
    const thread = await offgrid.thread({
      project,
      title: "JSON output",
      messages: ["Print the JSON"],
      model: "command-output",
    });
    await offgrid.open(thread);

    await expect(screen.getByText("The command printed one JSON line.")).toBeVisible();
    await screen.getByRole("button", "Worked for", { exact: false }).tap();
    await screen.getByRole("button", "node -e", { exact: false }).first().tap();
    await app.screenshot("expanded");
    await expect(screen.getByText('"requestId":"keep-me"', { exact: false })).toBeVisible();
  },
);
