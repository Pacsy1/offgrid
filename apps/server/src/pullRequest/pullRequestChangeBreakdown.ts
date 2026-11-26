import type { PullRequestChangeBreakdown } from "@offgrid/contracts";
import { summarizeChangedFiles } from "@offgrid/shared/changedFileKind";
import type { ProviderFileStats } from "@offgrid/source-control-core/server/PullRequestProvider";

export function toChangeBreakdown(stats: ProviderFileStats): PullRequestChangeBreakdown {
  if (stats.truncated) return null;
  return summarizeChangedFiles(stats.files);
}
