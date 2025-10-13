Objective
- Company master data for B2B (legal entity, CNPJ, settings).

Endpoints
- Store: `GET /store/companies`, `GET /store/companies/:id`.
- Admin: `GET/POST /admin/companies`, `GET/PUT/DELETE /admin/companies/:id`, CSV import/export.

Events
- `company.created` when a new company is created.

Migrations
- Add table `company` (id, name, cnpj, metadata).

