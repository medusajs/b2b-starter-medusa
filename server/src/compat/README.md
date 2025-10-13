Compat Layer
- Purpose: adapt existing v1 services/routes to Medusa v2 contracts without rewriting domain logic.

Folders
- http/: shared HTTP concerns (publishable key, JWT).
- validators/: DTO validation and normalization.
- services/: thin adapters calling legacy services and returning v2 shapes.
- logging/: request_id propagation and PII masking.

Usage
- Routes import from compat/* only; no duplicated logic in multiple places.

