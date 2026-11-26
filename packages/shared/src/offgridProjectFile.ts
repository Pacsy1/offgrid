import * as Exit from "effect/Exit";
import * as Schema from "effect/Schema";

import { OffgridProjectFile } from "@offgrid/contracts";

import { fromLenientJson } from "./schemaJson.ts";

export const OffgridProjectFileFromJson = fromLenientJson(OffgridProjectFile);

const decodeOffgridProjectFile = Schema.decodeExit(OffgridProjectFileFromJson);

export function parseOffgridProjectFile(contents: string): OffgridProjectFile | null {
  const decoded = decodeOffgridProjectFile(contents);
  return Exit.isSuccess(decoded) ? decoded.value : null;
}
