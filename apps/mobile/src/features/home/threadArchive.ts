import {
  threadRuntimeCanArchive,
  type ThreadRuntimeSummary,
} from "@offgrid/client-runtime/state/models";

export function threadCanArchive(runtime: ThreadRuntimeSummary | null | undefined): boolean {
  return threadRuntimeCanArchive(runtime);
}
