Objective
- Approval rules for carts/orders per company (thresholds, escalation).

Endpoints
- Store: `GET /store/approvals`, `POST /store/approvals/:id/(approve|reject)` (JWT).
- Admin: `GET/POST /admin/approvals/settings`.

Events
- `employee.spending_limit_exceeded`.

Migrations
- Add tables `approval_rule`, `approval_request`.

