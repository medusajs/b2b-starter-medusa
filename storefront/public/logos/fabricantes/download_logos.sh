#!/usr/bin/env bash
set -euo pipefail
CSV="logos_manifest.csv"
OUTDIR="logos"
mkdir -p "$OUTDIR"
# Requires: curl, jq (optional), sed
# This script downloads PNG and SVG logos into per-manufacturer folders.
# It skips empty URLs.
while IFS=, read -r manufacturer svg_url png_url source_note; do
  # Skip header
  if [[ "$manufacturer" == "manufacturer" ]]; then continue; fi
  # Normalize name (remove quotes via sed) and replace spaces with underscores
  name=$(echo "$manufacturer" | sed 's/^"\|"$//g' | sed 's/[\/\:*?"<>|]/-/g' | sed 's/ /_/g')
  # Strip quotes from URLs
  svg=$(echo "$svg_url" | sed 's/^"\|"$//g')
  png=$(echo "$png_url" | sed 's/^"\|"$//g')
  dir="$OUTDIR/$name"
  mkdir -p "$dir"
  if [[ -n "$svg" && "$svg" != " " ]]; then
    echo "→ SVG: $name"
    curl -L --fail --retry 3 "$svg" -o "$dir/logo.svg" || echo "   ⚠️ Falha no SVG de $name"
  fi
  if [[ -n "$png" && "$png" != " " ]]; then
    echo "→ PNG: $name"
    curl -L --fail --retry 3 "$png" -o "$dir/logo.png" || echo "   ⚠️ Falha no PNG de $name"
  fi
done < <(tail -n +2 "$CSV")
echo "Concluído. Logos em $OUTDIR/"
