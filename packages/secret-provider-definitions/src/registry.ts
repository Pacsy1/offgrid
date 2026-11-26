import { makeSecretProviderDefinitionRegistry } from "@offgrid/secret-provider-core/shared/definition";
import * as OnePassword from "@offgrid/secret-provider-onepassword/shared/definition";

export const builtInSecretProviderDefinitions = makeSecretProviderDefinitionRegistry([
  OnePassword.definition,
]);
