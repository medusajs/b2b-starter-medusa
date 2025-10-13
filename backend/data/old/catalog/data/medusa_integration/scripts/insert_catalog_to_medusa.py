"""
PoC: Insert unified catalog products into a running Medusa instance using Admin API.

Usage:
  python scripts/insert_catalog_to_medusa.py --category inverters --dry-run

Environment variables:
  MEDUSA_ADMIN_URL    e.g. http://localhost:9000
  MEDUSA_ADMIN_TOKEN  Admin API token (optional for dry-run)

This script is intentionally conservative: it writes a mapping file that
records which external product IDs were already imported to avoid duplicates.
"""
import os
import json
import argparse
import requests
from pathlib import Path

CATALOG_DIR = Path(__file__).resolve().parents[2] / "catalog" / "unified_schemas"
MAPPINGS_DIR = Path(__file__).resolve().parents[2] / "medusa_integration" / "mappings"
MAPPINGS_DIR.mkdir(parents=True, exist_ok=True)

MEDUSA_ADMIN_URL = os.getenv("MEDUSA_ADMIN_URL", "http://localhost:9000")
MEDUSA_ADMIN_TOKEN = os.getenv("MEDUSA_ADMIN_TOKEN", "")

HEADERS = {"Content-Type": "application/json"}
if MEDUSA_ADMIN_TOKEN:
    HEADERS["Authorization"] = f"Bearer {MEDUSA_ADMIN_TOKEN}"


def load_source(category: str):
    fp = CATALOG_DIR / f"{category}_unified.json"
    if not fp.exists():
        raise SystemExit(f"Source file not found: {fp}")
    return json.loads(fp.read_text(encoding="utf-8"))


def load_mapping(category: str):
    p = MAPPINGS_DIR / f"{category}_mapping.json"
    if p.exists():
        return json.loads(p.read_text(encoding="utf-8"))
    return {}


def save_mapping(category: str, mapping: dict):
    p = MAPPINGS_DIR / f"{category}_mapping.json"
    p.write_text(json.dumps(mapping, indent=2, ensure_ascii=False), encoding="utf-8")


def medusa_create_product(payload: dict):
    url = f"{MEDUSA_ADMIN_URL.rstrip('/')}" + "/admin/products"
    resp = requests.post(url, headers=HEADERS, json={"product": payload})
    if resp.status_code not in (200, 201):
        raise RuntimeError(f"Medusa API error: {resp.status_code} {resp.text}")
    return resp.json().get("product")


def build_medusa_payload(item: dict):
    # Map the unified schema fields to Medusa's product structure.
    product = {
        "title": item.get("title") or item.get("name") or "",
        "handle": item.get("slug") or None,
        "description": item.get("description") or item.get("summary") or "",
        "is_giftcard": False,
        "status": "published",
        "metadata": item.get("metadata") or {},
        # external source ID
        "external_id": item.get("id") or item.get("external_id"),
        # variants mapping (best-effort)
        "variants": [],
    }

    variants = item.get("variants") or item.get("skus") or []
    if not variants:
        # create a single default variant
        price = item.get("pricing", {}).get("original_price") or item.get("price")
        variant = {
            "title": product["title"],
            "sku": item.get("sku") or None,
            "prices": [],
            "metadata": {"external_id": item.get("id")},
        }
        if price:
            variant["prices"].append({"amount": int(price * 100) if isinstance(price, (int, float)) else price, "currency_code": "BRL"})
        product["variants"].append(variant)
    else:
        for v in variants:
            price = v.get("price") or v.get("pricing", {}).get("original_price")
            variant = {
                "title": v.get("title") or v.get("name") or v.get("sku"),
                "sku": v.get("sku") or None,
                "prices": [],
                "metadata": {"external_id": v.get("id") or v.get("external_id")},
            }
            if price:
                variant["prices"].append({"amount": int(price * 100) if isinstance(price, (int, float)) else price, "currency_code": v.get("currency") or "BRL"})
            product["variants"].append(variant)

    return product


def run(category: str, dry_run: bool = True):
    source = load_source(category)
    mapping = load_mapping(category)

    created = 0
    skipped = 0

    for item in source:
        ext_id = item.get("id") or item.get("external_id")
        if not ext_id:
            print("Skipping item without external id: ", item.get("title") or item.get("name"))
            skipped += 1
            continue

        if ext_id in mapping:
            skipped += 1
            continue

        payload = build_medusa_payload(item)

        if dry_run:
            print("DRY RUN payload for:", ext_id)
            print(json.dumps(payload, indent=2, ensure_ascii=False)[:1000])
            mapping[ext_id] = {"status": "dry_run", "payload_preview": payload.get("title")}
            created += 1
            continue

        # perform API call
        try:
            product = medusa_create_product(payload)
            mapping[ext_id] = {"status": "created", "medusa_id": product.get("id")}
            created += 1
            print("Created product", product.get("id"), payload.get("title"))
        except Exception as e:
            mapping[ext_id] = {"status": "error", "error": str(e)}
            print("Error creating", ext_id, e)

    save_mapping(category, mapping)
    print(f"Done. created: {created}, skipped: {skipped}, mapping: {MAPPINGS_DIR}/{category}_mapping.json")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import unified catalog category to Medusa Admin API")
    parser.add_argument("--category", required=True, help="Category name (inverters, kits, panels, etc.)")
    parser.add_argument("--dry-run", action="store_true", help="Don't call Medusa; only show payloads")
    args = parser.parse_args()

    run(args.category, dry_run=args.dry_run)
