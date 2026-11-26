import { describe, expect, it } from "vite-plus/test";

import {
  OFFGRID_MCP_TOOL_NAMES,
  resolveOffgridMcpSummaryAction,
  resolveOffgridMcpToolDefinition,
  resolveOffgridMcpToolPresentation,
} from "./offgridMcpToolPresentation.ts";

describe("resolveOffgridMcpToolPresentation", () => {
  it("recognizes every Offgrid tool across provider prefixes and completion suffixes", () => {
    for (const tool of OFFGRID_MCP_TOOL_NAMES) {
      const presentation = resolveOffgridMcpToolPresentation(tool);
      for (const prefix of [
        "mcp__offgrid__",
        "mcp__offgrid__",
        "mcp__offgrid__",
        "Offgrid.",
        "offgrid.",
        "offgrid-direct.",
        "mcp__offgrid_direct__",
        "offgrid/",
        "offgrid:",
        "mcp_offgrid_",
        "Offgrid ",
        "offgrid · ",
      ]) {
        expect(resolveOffgridMcpToolPresentation(`${prefix}${tool} completed`), tool).toEqual(
          presentation,
        );
      }
      expect(resolveOffgridMcpToolPresentation(`mcp__another-server__${tool}`), tool).toBeNull();
    }
  });

  it("matches OpenCode 2's per-thread server names, whose thread ids hold underscores", () => {
    expect(
      resolveOffgridMcpToolPresentation("offgrid-thread_opencode2-adapter_delegate_task")?.displayName,
    ).toBe("Delegate a child task");
    expect(resolveOffgridMcpToolPresentation("offgrid-thread_opencode2-adapter_not_a_tool")).toBeNull();
  });
});

describe("resolveOffgridMcpToolDefinition", () => {
  it("labels an action tool call as the action it ran", () => {
    expect(
      resolveOffgridMcpToolDefinition("mcp__offgrid__preview_act", { action: "type" })?.labels,
    ).toEqual(resolveOffgridMcpToolDefinition("preview_type")?.labels);
    expect(resolveOffgridMcpToolDefinition("offgrid_thread_transfer", { action: "fork" })?.displayName).toBe(
      resolveOffgridMcpToolDefinition("offgrid_thread_fork")?.displayName,
    );
    expect(resolveOffgridMcpToolDefinition("preview_act", { action: "unknown" })?.labels[2]).toBe(
      "Used",
    );
  });
});

describe("resolveOffgridMcpSummaryAction", () => {
  it("summarizes an action tool by the action each call ran", () => {
    expect(resolveOffgridMcpSummaryAction("mcp__offgrid__offgrid_queue", { action: "list" })).toBe(
      "queue-list",
    );
    expect(resolveOffgridMcpSummaryAction("offgrid_queue", { action: "edit" })).toBe("queue-edit");
    expect(resolveOffgridMcpSummaryAction("offgrid_thread_transfer", { action: "status" })).toBe(
      "thread-transfers",
    );
    expect(resolveOffgridMcpSummaryAction("offgrid_thread_configure", {})).toBe("thread-configuration");
    expect(resolveOffgridMcpSummaryAction("schedule_task", { scheduledTaskId: "task-1" })).toBe(
      "schedule-update",
    );
    expect(resolveOffgridMcpSummaryAction("delegate_task", { task: "x" })).toBe("delegate");
  });
});
