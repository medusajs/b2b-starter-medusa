import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AdminGetQuoteParamsType } from "./validators";
import { APIResponse } from "../../../utils/api-response";
import { APIVersionManager } from "../../../utils/api-versioning";

export const GET = async (
  req: MedusaRequest<AdminGetQuoteParamsType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { fields, pagination } = req.remoteQueryConfig;
  const { data: quotes, metadata } = await query.graph({
    entity: "quote",
    fields,
    pagination: {
      ...pagination,
      skip: pagination.skip!,
    },
  });

  res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION));
  APIResponse.paginated(res, quotes, {
    count: metadata!.count,
    offset: metadata!.skip,
    limit: metadata!.take,
    total: metadata!.count,
  });
};
