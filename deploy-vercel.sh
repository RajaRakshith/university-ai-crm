#!/usr/bin/env bash
# Quick Deployment Script for Vercel

echo "🚀 UniConnect CRM - Quick Deploy to Vercel"
echo "=========================================="
echo ""

# Check if Git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: UniConnect CRM - AI-powered university engagement"
else
    echo "✅ Git repository already initialized"
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI not found. Please:"
    echo "   1. Install: https://cli.github.com/"
    echo "   2. Or create repo manually at https://github.com/new"
    echo ""
    read -p "Press Enter after creating GitHub repo and adding remote..."
else
    echo "📤 Creating GitHub repository..."
    gh repo create university-ai-crm --public --source=. --remote=origin --push || {
        echo "✅ Repository might already exist. Pushing changes..."
        git push -u origin main || git push -u origin master
    }
fi

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "📋 Next steps:"
echo "   1. Go to https://vercel.com"
echo "   2. Sign in with GitHub"
echo "   3. Click 'New Project'"
echo "   4. Import 'university-ai-crm' repository"
echo "   5. Click 'Deploy' (Vercel auto-detects Next.js)"
echo ""
echo "⚙️  After deployment, add these environment variables in Vercel:"
echo "   (Project Settings → Environment Variables)"
echo ""
echo "DATABASE_URL=file:./dev.db"
echo "OCI_GENERATIVE_AI_ENABLED=true"
echo "OCI_TENANCY_OCID=${OCI_TENANCY_OCID}"
echo "OCI_USER_OCID=${OCI_USER_OCID}"
echo "OCI_FINGERPRINT=${OCI_FINGERPRINT}"
echo "OCI_REGION=${OCI_REGION}"
echo "OCI_COMPARTMENT_OCID=${OCI_COMPARTMENT_OCID}"
echo "OCI_GENAI_MODEL=${OCI_GENAI_MODEL}"
echo "OCI_GENAI_ENDPOINT=${OCI_GENAI_ENDPOINT}"
echo "OCI_OBJECT_STORAGE_NAMESPACE=${OCI_OBJECT_STORAGE_NAMESPACE}"
echo ""
echo "🔑 For OCI_PRIVATE_KEY:"
echo "   Copy the entire content of ocu_private.pem (including BEGIN/END lines)"
echo ""
echo "🎉 Your app will be live at: https://university-ai-crm-xxxx.vercel.app"
