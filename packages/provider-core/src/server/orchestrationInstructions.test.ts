import { assert, describe, it } from "@effect/vitest";

import {
  OFFGRID_DEVICE_TOOL_INSTRUCTIONS,
  OFFGRID_DEVICE_TOOL_INSTRUCTIONS_WITH_TOOL_SEARCH,
  OFFGRID_ORCHESTRATION_INSTRUCTIONS,
  offgridAcpPromptWithInstructions,
  offgridOrchestrationPrompt,
  offgridOrchestrationSystemPrompt,
} from "./orchestrationInstructions.ts";

describe("Offgrid device instructions", () => {
  it("route device work through device_open and give Claude the line that loads the tools", () => {
    for (const intent of ["`device_list`", "`device_open`", "`agent-device`", "ssh", "`hostId`"]) {
      assert.include(OFFGRID_DEVICE_TOOL_INSTRUCTIONS, intent);
    }
    assert.notInclude(OFFGRID_DEVICE_TOOL_INSTRUCTIONS, "ToolSearch");
    const loadLine =
      " Load them with ToolSearch `select:mcp__offgrid__device_list,mcp__offgrid__device_open,mcp__offgrid__device_screenshot,mcp__offgrid__device_close`.";
    assert.include(OFFGRID_DEVICE_TOOL_INSTRUCTIONS_WITH_TOOL_SEARCH, loadLine);
    assert.equal(
      OFFGRID_DEVICE_TOOL_INSTRUCTIONS_WITH_TOOL_SEARCH.replace(loadLine, ""),
      OFFGRID_DEVICE_TOOL_INSTRUCTIONS,
    );
  });

  it("open the app before the returned command's snapshots, screenshots and input", () => {
    assert.include(
      OFFGRID_DEVICE_TOOL_INSTRUCTIONS,
      "its snapshots, screenshots and input need `open <app>` first,",
    );
  });

  it("keep the failure rule from taking over or closing a session another thread holds", () => {
    // agent-device's DEVICE_IN_USE advice is to rerun with the owner's --session or close it first.
    assert.include(
      OFFGRID_DEVICE_TOOL_INSTRUCTIONS,
      "follow its advice once, but never reuse or close another session; if it still fails,",
    );
  });

  it("reach OpenCode and Cursor only when the session holds device access", () => {
    assert.include(offgridOrchestrationSystemPrompt(true, true), OFFGRID_DEVICE_TOOL_INSTRUCTIONS);
    assert.notInclude(offgridOrchestrationSystemPrompt(true, false), "## Offgrid devices");
    assert.isUndefined(offgridOrchestrationSystemPrompt(false, true));

    const firstRun = (hasDeviceTools: boolean) =>
      offgridOrchestrationPrompt({
        prompt: "Check the login screen.",
        hasOffgridMcp: true,
        hasDeviceTools,
        orchestrationDelivered: false,
        deviceInstructionsDelivered: false,
      });
    assert.include(firstRun(true), OFFGRID_DEVICE_TOOL_INSTRUCTIONS);
    assert.notInclude(firstRun(false), "## Offgrid devices");

    const laterRun = (deviceInstructionsDelivered: boolean) =>
      offgridOrchestrationPrompt({
        prompt: "Check the login screen.",
        hasOffgridMcp: true,
        hasDeviceTools: true,
        orchestrationDelivered: true,
        deviceInstructionsDelivered,
      });
    assert.include(laterRun(false), OFFGRID_DEVICE_TOOL_INSTRUCTIONS);
    assert.notInclude(laterRun(false), OFFGRID_ORCHESTRATION_INSTRUCTIONS.trim());
    assert.equal(laterRun(true), "Check the login screen.");

    // A provider's own guidance reaches a conversation that already had the rest.
    const providerRun = (providerInstructionsDelivered: boolean) =>
      offgridOrchestrationPrompt({
        prompt: "Check the login screen.",
        hasOffgridMcp: true,
        hasDeviceTools: false,
        orchestrationDelivered: true,
        deviceInstructionsDelivered: false,
        providerInstructions: "Mark awaited shells.",
        providerInstructionsDelivered,
      });
    assert.include(providerRun(false), "Mark awaited shells.");
    assert.notInclude(providerRun(false), OFFGRID_ORCHESTRATION_INSTRUCTIONS.trim());
    assert.equal(providerRun(true), "Check the login screen.");
  });

  it("reach ACP agents again when device access changes mid-thread", () => {
    const state = { interactionMode: "default", hasOffgridMcp: true, hasDeviceTools: false } as const;
    const withDevices = offgridAcpPromptWithInstructions({
      prompt: "Check the login screen.",
      state: { ...state, hasDeviceTools: true },
      previousState: state,
    });
    assert.include(withDevices, OFFGRID_DEVICE_TOOL_INSTRUCTIONS);
    assert.equal(
      offgridAcpPromptWithInstructions({ prompt: "Again.", state, previousState: state }),
      "Again.",
    );
    assert.notInclude(offgridAcpPromptWithInstructions({ prompt: "Hi.", state }), "## Offgrid devices");
  });
});
