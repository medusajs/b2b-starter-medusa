import { MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { RequestWithContext } from "@medusajs/medusa/api/store/products/helpers";
import { z } from "zod";
import { ALGOLIA_MODULE } from "../../../../modules/algolia";
import AlgoliaModuleService from "../../../../modules/algolia/service";

export const SearchSchema = z.object({
  query: z.string(),
});

type SearchRequest = z.infer<typeof SearchSchema>;

export async function POST(
  req: RequestWithContext<SearchRequest>,
  res: MedusaResponse
) {
  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);
  const algoliaModuleService: AlgoliaModuleService =
    req.scope.resolve(ALGOLIA_MODULE);

  const { query } = req.validatedBody;

  const [{ employee }] = await remoteQuery(
    {
      entryPoint: "customer",
      fields: ["employee.company.id"],
      variables: {
        filters: { id: req.auth_context?.actor_id },
      },
    },
    { throwIfKeyNotFound: true }
  );

  if (!employee) {
    throw new Error("No employee");
  }

  const results = await algoliaModuleService.search(query, employee.company_id);

  res.json(results);
}
