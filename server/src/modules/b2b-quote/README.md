Objective
- RFQ/Quote orchestration for B2B purchasing.

Endpoints
- Store: `POST/GET /store/quotes`, `POST /store/quotes/:id/(accept|reject)`.
- Admin: `GET /admin/quotes`, `POST /admin/quotes/:id`.

Events
- `quote.accepted`, `quote.rejected`.

Migrations
- Add table `quote` (id, company_id, items, status, messages).

