import { expect } from "e2e";

import { test, WEB } from "./offgrid.ts";

test(
  "A seeded thread opens by its link and shows its history",
  WEB,
  async ({ offgrid, app, screen }) => {
    const project = await offgrid.project("demo");
    const thread = await offgrid.thread({
      project,
      title: "Earlier work",
      messages: ["first", "second"],
    });
    await offgrid.open(thread);

    await expect(screen.getByText("second fixture turn complete", { exact: false })).toBeVisible();
    await app.screenshot("thread");
  },
);
