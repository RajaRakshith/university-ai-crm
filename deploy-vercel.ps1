# Quick Deployment Script for Vercel (PowerShell)

Write-Host "🚀 UniConnect CRM - Quick Deploy to Vercel" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is initialized
if (-not (Test-Path .git)) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit: UniConnect CRM - AI-powered university engagement"
} else {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
}

# Check if GitHub CLI is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  GitHub CLI not found." -ForegroundColor Yellow
    Write-Host "   Option 1: Install GitHub CLI from https://cli.github.com/"
    Write-Host "   Option 2: Create repo manually at https://github.com/new"
    Write-Host ""
    Read-Host "Press Enter after creating GitHub repo and adding remote"
} else {
    Write-Host "📤 Creating GitHub repository..." -ForegroundColor Yellow
    gh repo create university-ai-crm --public --source=. --remote=origin --push
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✅ Repository might already exist. Pushing changes..." -ForegroundColor Green
        git push -u origin main
        if ($LASTEXITCODE -ne 0) {
            git push -u origin master
        }
    }
}

Write-Host ""
Write-Host "✅ Code pushed to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Go to https://vercel.com"
Write-Host "   2. Sign in with GitHub"
Write-Host "   3. Click 'New Project'"
Write-Host "   4. Import 'university-ai-crm' repository"
Write-Host "   5. Click 'Deploy' (Vercel auto-detects Next.js)"
Write-Host ""
Write-Host "⚙️  After deployment, add these environment variables in Vercel:" -ForegroundColor Yellow
Write-Host "   (Project Settings → Environment Variables)"
Write-Host ""

# Load .env file to show values
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.+)$') {
            $key = $matches[1]
            $value = $matches[2]
            # Don't show full private key path
            if ($key -like "*PRIVATE_KEY_PATH*") {
                Write-Host "$key=<paste content of ocu_private.pem>"
            } else {
                Write-Host "$_"
            }
        }
    }
}

Write-Host ""
Write-Host "🔑 For OCI_PRIVATE_KEY:" -ForegroundColor Yellow
Write-Host "   In Vercel, add environment variable OCI_PRIVATE_KEY"
Write-Host "   Paste entire content of ocu_private.pem (including -----BEGIN PRIVATE KEY----- lines)"
Write-Host ""
Write-Host "📝 Also add:" -ForegroundColor Yellow
Write-Host "   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app"
Write-Host "   (Update with your actual Vercel URL after first deploy)"
Write-Host ""
Write-Host "🎉 Your app will be live at: https://university-ai-crm-xxxx.vercel.app" -ForegroundColor Green
Write-Host ""
Write-Host "Press Enter to open Vercel in browser..."
Read-Host
Start-Process "https://vercel.com/new"
