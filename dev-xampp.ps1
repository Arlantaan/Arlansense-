# Quick development script for XAMPP
# This script builds and deploys to XAMPP for testing

Write-Host "🔧 Building for XAMPP..." -ForegroundColor Yellow

# Build the project
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Copy built files to XAMPP root
Write-Host "📁 Copying files to XAMPP..." -ForegroundColor Yellow
Copy-Item -Path "dist\*" -Destination "." -Recurse -Force

Write-Host "✅ XAMPP deployment complete!" -ForegroundColor Green
Write-Host "🌐 Access your site at: http://localhost/newsense/" -ForegroundColor Cyan
Write-Host "🚀 For development with live reload, use: npm run dev" -ForegroundColor Cyan
