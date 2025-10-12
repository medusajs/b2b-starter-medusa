This folder contains templates and PoC scripts to integrate the catalog under `data/catalog/unified_schemas` with a Medusa.js application.

Purpose:
- Provide a minimal Medusa Module skeleton (ERP service + workflows) based on the Medusa ERP recipe.
- Provide a Python PoC script to import a unified category (example: inverters) into a running Medusa instance using its Admin API.

Files:
- `templates/erp_service.ts` — example TypeScript service for a Medusa `erp` module.
- `templates/sync-from-erp.ts` — example workflow that fetches products via the `erp` service and creates them in Medusa.
- `templates/sync-order-to-erp.ts` — example workflow to sync orders to ERP.
- `scripts/insert_catalog_to_medusa.py` — Python PoC script that imports `unified_schemas/inverters_unified.json` to Medusa (supports dry-run and mapping file output).
- `mappings/` — output directory where the PoC writes the mapping between external IDs and created Medusa product IDs.

How to use the PoC script:
1. Configure environment variables:
   - `MEDUSA_ADMIN_URL` e.g. `http://localhost:9000`
   - `MEDUSA_ADMIN_TOKEN` a valid Admin API token for your Medusa instance (or leave empty for dry-run)
2. Run the script in dry-run mode first to preview payloads:
   python scripts/insert_catalog_to_medusa.py --category inverters --dry-run
3. When ready, run without `--dry-run` to perform API calls.

Notes:
- The TypeScript templates are intended as a copy-paste starting point into a Medusa project. They live here as documentation and example code.
- The Python PoC is lightweight and idempotent: it preserves a mapping file so repeated runs won't create duplicates unless forced.

If you want, I can scaffold these templates directly into a Medusa project in this workspace or adapt the importer to use Medusa server-side services (instead of Admin API).