import { expect } from "e2e";

import { test, WEB } from "./offgrid.ts";

test("An invalid host filter keeps the Issues page open", WEB, async ({ offgrid, app, browser }) => {
  await offgrid.project("demo");
  await offgrid.open("/issues?host=true");

  await app.screenshot("issues-invalid-host");
  await expect(browser.locator("h1")).toHaveText("Issues");
});
