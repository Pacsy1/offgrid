import {
  OFFGRID_PROJECT_FILE_NAME,
  type EnvironmentId,
  type OffgridProjectFile,
  type OffgridProjectFileScript,
} from "@offgrid/contracts";
import { parseOffgridProjectFile } from "@offgrid/shared/offgridProjectFile";

import { useProjectFileQuery } from "~/components/files/projectFilesQueryState";

const NO_SCRIPTS: ReadonlyArray<OffgridProjectFileScript> = [];

export interface OffgridProjectFileState {
  status: "loading" | "missing" | "invalid" | "valid";
  file: OffgridProjectFile | null;
  scripts: ReadonlyArray<OffgridProjectFileScript>;
}

export function useOffgridProjectFileState(
  environmentId: EnvironmentId,
  cwd: string | null,
): OffgridProjectFileState {
  const query = useProjectFileQuery(environmentId, cwd ?? "", OFFGRID_PROJECT_FILE_NAME, cwd !== null);
  const contents = query.data && !query.data.truncated ? query.data.contents : null;
  const isPending = query.isPending;
  if (contents === null) {
    return {
      status: isPending ? "loading" : "missing",
      file: null,
      scripts: NO_SCRIPTS,
    } as const;
  }
  const file = parseOffgridProjectFile(contents);
  if (file === null) {
    return { status: "invalid", file: null, scripts: NO_SCRIPTS } as const;
  }
  return { status: "valid", file, scripts: file.scripts ?? NO_SCRIPTS } as const;
}

export function useOffgridProjectFileScripts(
  environmentId: EnvironmentId,
  cwd: string | null,
): ReadonlyArray<OffgridProjectFileScript> {
  return useOffgridProjectFileState(environmentId, cwd).scripts;
}
