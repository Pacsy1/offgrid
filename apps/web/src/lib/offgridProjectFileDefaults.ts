import {
  OFFGRID_PROJECT_FILE_NAME,
  type EnvironmentId,
  type ProjectReadFileResult,
  type OffgridProjectFile,
} from "@offgrid/contracts";
import { parseOffgridProjectFile } from "@offgrid/shared/offgridProjectFile";
import { executeAtomQuery } from "@offgrid/client-runtime/state/runtime";
import { AsyncResult } from "effect/reactivity";

import {
  getProjectFileQueryAtom,
  resolveProjectFileQueryData,
} from "~/components/files/projectFilesQueryState";
import { appAtomRegistry } from "~/rpc/atomRegistry";

function toOffgridProjectFile(
  environmentId: EnvironmentId,
  workspaceRoot: string,
  result: ProjectReadFileResult | null,
): OffgridProjectFile | null {
  const data = resolveProjectFileQueryData(
    environmentId,
    workspaceRoot,
    OFFGRID_PROJECT_FILE_NAME,
    result,
  );
  if (data === null || data.exists === false || data.truncated) return null;
  return parseOffgridProjectFile(data.contents);
}

export async function readOffgridProjectFile(
  environmentId: EnvironmentId,
  workspaceRoot: string,
): Promise<OffgridProjectFile | null> {
  const result = await executeAtomQuery(
    appAtomRegistry,
    getProjectFileQueryAtom(environmentId, workspaceRoot, OFFGRID_PROJECT_FILE_NAME),
    { reportDefect: false, reportFailure: false },
  );
  return toOffgridProjectFile(
    environmentId,
    workspaceRoot,
    result._tag === "Success" ? result.value : null,
  );
}

/** The project's offgrid.json from an earlier read, or `undefined` when none has loaded yet. */
export function peekOffgridProjectFile(
  environmentId: EnvironmentId,
  workspaceRoot: string,
): OffgridProjectFile | null | undefined {
  const result = appAtomRegistry.get(
    getProjectFileQueryAtom(environmentId, workspaceRoot, OFFGRID_PROJECT_FILE_NAME),
  );
  return AsyncResult.isSuccess(result)
    ? toOffgridProjectFile(environmentId, workspaceRoot, result.value)
    : undefined;
}
