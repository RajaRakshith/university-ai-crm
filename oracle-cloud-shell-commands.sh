#!/bin/bash
# Oracle Cloud Shell Commands to Find Available GenAI Models

echo "🔍 Oracle Cloud GenAI Discovery Script"
echo "======================================="
echo ""

# 1. List all Generative AI models available in your compartment
echo "📋 Step 1: List all available Generative AI models"
echo "Run this command:"
echo ""
echo "oci generative-ai model list --compartment-id <your-compartment-ocid> --all"
echo ""
echo "Or to list in the root compartment (tenancy):"
echo "oci generative-ai model list --compartment-id <your-tenancy-ocid> --all"
echo ""
echo "---"
echo ""

# 2. List models with better formatting
echo "📋 Step 2: List models with JSON output for easier reading"
echo "Run this command:"
echo ""
echo "oci generative-ai model list --compartment-id <your-compartment-ocid> --all | jq '.data[] | {id: .id, name: .\"display-name\", vendor: .vendor, version: .version}'"
echo ""
echo "---"
echo ""

# 3. Search for specific model types
echo "🔎 Step 3: Search for Cohere models specifically"
echo "Run this command:"
echo ""
echo "oci generative-ai model list --compartment-id <your-compartment-ocid> --all | jq '.data[] | select(.vendor==\"cohere\")'"
echo ""
echo "---"
echo ""

# 4. Get your compartment OCID
echo "📦 Step 4: If you don't know your compartment OCID:"
echo "Run this command:"
echo ""
echo "oci iam compartment list --all | jq '.data[] | {name: .name, id: .id}'"
echo ""
echo "---"
echo ""

# 5. Get your tenancy OCID
echo "🏢 Step 5: Get your tenancy OCID:"
echo "Run this command:"
echo ""
echo "oci iam compartment get --compartment-id \$(oci iam availability-domain list --query 'data[0].\"compartment-id\"' --raw-output)"
echo ""
echo "Or simply:"
echo "echo \$OCI_TENANCY"
echo ""
echo "---"
echo ""

# 6. Check if GenAI service is available
echo "✅ Step 6: Check if Generative AI service is available in your region"
echo "Run this command:"
echo ""
echo "oci generative-ai model list --help"
echo ""
echo "If you get an error like 'Service not found' or 'NotAuthorizedOrNotFound',"
echo "then Generative AI is not enabled in your tenancy/region."
echo ""
echo "---"
echo ""

echo "🎯 QUICK START - Copy and paste this into Oracle Cloud Shell:"
echo "================================================================"
echo ""
echo "# Set your compartment OCID (replace with yours)"
echo "COMPARTMENT_OCID=\"your-compartment-ocid-here\""
echo ""
echo "# List all models"
echo "oci generative-ai model list --compartment-id \$COMPARTMENT_OCID --all"
echo ""
echo "# Or with pretty formatting"
echo "oci generative-ai model list --compartment-id \$COMPARTMENT_OCID --all | python3 -m json.tool"
echo ""
echo "================================================================"
echo ""

echo "📝 What to look for in the output:"
echo "  - 'id': This is the model OCID you need for OCI_GENAI_MODEL"
echo "  - 'display-name': Human-readable model name"
echo "  - 'vendor': Model provider (cohere, meta, etc.)"
echo "  - 'lifecycle-state': Should be 'ACTIVE'"
echo ""
echo "Example output:"
echo '  "id": "ocid1.generativeaimodel.oc1.us-ashburn-1.amaaaaaxxxxxx",'
echo '  "display-name": "cohere.command-r-plus",'
echo '  "vendor": "cohere",'
echo '  "lifecycle-state": "ACTIVE"'
echo ""
