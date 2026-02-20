#!/usr/bin/env bash
# Clear all objects in the OCI Object Storage bucket used by the app.
# Run from repo root. Requires: OCI CLI installed and configured (oci setup config).
# Option: pass --dry-run to only list what would be deleted (no deletions).
set -e
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "No .env found. Copy .env.example and set OCI_* vars."
  exit 1
fi

set -a
source .env
set +a

NS="${OCI_OBJECTSTORAGE_NAMESPACE:?Set OCI_OBJECTSTORAGE_NAMESPACE in .env}"
BUCKET="${OCI_OBJECTSTORAGE_BUCKET:?Set OCI_OBJECTSTORAGE_BUCKET in .env}"
REGION="${OCI_REGION:-us-ashburn-1}"

DRY_RUN=""
if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN="--dry-run"
  echo "=== DRY RUN: no objects will be deleted ==="
fi

echo "Bucket: $BUCKET (namespace: $NS, region: $REGION)"
if [ -n "$DRY_RUN" ]; then
  oci os object bulk-delete --bucket-name "$BUCKET" --namespace-name "$NS" --region "$REGION" $DRY_RUN
else
  oci os object bulk-delete --bucket-name "$BUCKET" --namespace-name "$NS" --region "$REGION" --force
fi
echo "Done."
