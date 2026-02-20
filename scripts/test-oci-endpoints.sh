#!/usr/bin/env bash
# Test OCI endpoints used by the app: Object Storage (Ashburn), GenAI embed (Chicago).
# Run from repo root. Requires: OCI CLI installed and configured (oci setup config), and .env with OCI_* vars.
set -e
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "No .env found. Copy .env.example and set OCI_* and DATABASE_URL."
  exit 1
fi

set -a
source .env
set +a

COMP="${OCI_COMPARTMENT_OCID:?Set OCI_COMPARTMENT_OCID in .env}"
REGION_MAIN="${OCI_REGION:-us-ashburn-1}"
REGION_GENAI="${OCI_GENAI_REGION:-us-chicago-1}"
NS="${OCI_OBJECTSTORAGE_NAMESPACE:?Set OCI_OBJECTSTORAGE_NAMESPACE in .env}"
BUCKET="${OCI_OBJECTSTORAGE_BUCKET:?Set OCI_OBJECTSTORAGE_BUCKET in .env}"

echo "=== 1. Object Storage (region=$REGION_MAIN, bucket=$BUCKET) ==="
if oci os object list --bucket-name "$BUCKET" --namespace-name "$NS" --region "$REGION_MAIN" >/dev/null 2>&1; then
  echo "OK - Can list objects in bucket."
else
  echo "FAIL - Cannot access bucket. Check OCI_REGION, namespace, bucket name, and IAM policy for object storage."
  exit 1
fi

echo ""
echo "=== 2. GenAI Embed (region=$REGION_GENAI, model=cohere.embed-english-v3.0) ==="
if oci generative-ai-inference embed-text-result embed-text \
  --compartment-id "$COMP" \
  --region "$REGION_GENAI" \
  --inputs '["test"]' \
  --serving-mode '{"servingType":"ON_DEMAND","modelId":"cohere.embed-english-v3.0"}' 2>/dev/null | grep -q '"embeddings"'; then
  echo "OK - Embed text succeeded."
else
  echo "FAIL - Embed text failed. Ensure OCI_GENAI_REGION=us-chicago-1 and your CLI/user has policy: use ai-service-generative-inference in compartment."
  exit 1
fi

echo ""
echo "All endpoint checks passed."
