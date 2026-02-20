#!/bin/bash

# Oracle Cloud Deployment Script for Ross AI Hackathon
# Usage: ./deploy-oracle.sh

set -e

echo "🚀 UniConnect CRM - Oracle Cloud Deployment"
echo "============================================"

# Configuration
TENANCY_NAMESPACE="ross_ai_hackathon"
REGION="us-ashburn-1"
COMPARTMENT_OCID=${OCI_COMPARTMENT_OCID}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker."
    exit 1
fi

if ! command -v oci &> /dev/null; then
    echo "⚠️  OCI CLI not found. Installing..."
    bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"
fi

echo "✅ Prerequisites OK"

# Build Docker image
echo ""
echo "🔨 Building Docker image..."
docker build -t uniconnect-crm:latest .

# Tag for Oracle Container Registry
IMAGE_TAG="${REGION}.ocir.io/${TENANCY_NAMESPACE}/uniconnect-crm:latest"
docker tag uniconnect-crm:latest ${IMAGE_TAG}

echo "✅ Image built: ${IMAGE_TAG}"

# Login to OCIR
echo ""
echo "🔐 Logging in to Oracle Container Registry..."
echo "   Use your Oracle Cloud username and auth token"
docker login ${REGION}.ocir.io

# Push to OCIR
echo ""
echo "📤 Pushing image to OCIR..."
docker push ${IMAGE_TAG}

echo "✅ Image pushed successfully"

# Create container instance config
cat > container-config.json <<EOF
{
  "displayName": "uniconnect-crm-instance",
  "compartmentId": "${COMPARTMENT_OCID}",
  "availabilityDomain": "${REGION}-AD-1",
  "shape": "CI.Standard.E4.Flex",
  "shapeConfig": {
    "ocpus": 1.0,
    "memoryInGBs": 4.0
  },
  "containers": [
    {
      "displayName": "uniconnect-app",
      "imageUrl": "${IMAGE_TAG}",
      "environmentVariables": {
        "NODE_ENV": "production",
        "OCI_GENERATIVE_AI_ENABLED": "true"
      }
    }
  ],
  "vncs": [
    {
      "subnetId": "${SUBNET_OCID}"
    }
  ]
}
EOF

echo ""
echo "🎯 Deployment Configuration:"
echo "   Image: ${IMAGE_TAG}"
echo "   Compartment: ${COMPARTMENT_OCID}"
echo ""
echo "📝 Next steps:"
echo "   1. Go to OCI Console > Container Instances"
echo "   2. Create Container Instance"
echo "   3. Use image: ${IMAGE_TAG}"
echo "   4. Add environment variables from .env.oracle"
echo "   5. Configure networking (VCN, subnet, security lists)"
echo ""
echo "Or deploy via OCI CLI:"
echo "   oci container-instances container-instance create \\"
echo "     --from-json file://container-config.json"
echo ""
echo "✅ Deployment preparation complete!"
