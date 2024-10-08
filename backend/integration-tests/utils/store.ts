import {
  ApiKeyType,
  Modules,
  PUBLISHABLE_KEY_HEADER,
} from "@medusajs/framework/utils";
import {
  ApiKeyDTO,
  IApiKeyModuleService,
  MedusaContainer,
} from "@medusajs/framework/types";

export const generatePublishableKey = async (appContainer: MedusaContainer) => {
  const apiKeyModule = appContainer.resolve<IApiKeyModuleService>(
    Modules.API_KEY
  );

  return await apiKeyModule.createApiKeys({
    title: "test publishable key",
    type: ApiKeyType.PUBLISHABLE,
    created_by: "test",
  });
};

export const generateStoreHeaders = ({
  publishableKey,
}: {
  publishableKey: ApiKeyDTO;
}) => {
  return {
    headers: {
      [PUBLISHABLE_KEY_HEADER]: publishableKey.token,
    },
  };
};
