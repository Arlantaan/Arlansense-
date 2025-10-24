# Complete XAMPP Development Setup
# This script builds frontend and sets up backend for XAMPP development

Write-Host "🔧 Complete XAMPP Development Setup" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

# Step 1: Build Frontend
Write-Host "`n📦 Building Frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Copy Frontend to XAMPP
Write-Host "`n📁 Copying Frontend to XAMPP..." -ForegroundColor Yellow
Copy-Item -Path "dist\*" -Destination "." -Recurse -Force

# Step 3: Setup Python Backend
Write-Host "`n🐍 Setting up Python Backend..." -ForegroundColor Yellow

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python 3.11+" -ForegroundColor Red
    Write-Host "Download from: https://www.python.org/downloads/" -ForegroundColor Cyan
    exit 1
}

# Check if virtual environment exists
if (-not (Test-Path "backend\.venv")) {
    Write-Host "📦 Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv backend\.venv
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& "backend\.venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "📥 Installing Python dependencies..." -ForegroundColor Yellow
pip install -r backend\requirements.txt

# Run type checking
Write-Host "🔍 Running type checking..." -ForegroundColor Yellow
mypy backend\ --config-file backend\mypy.ini

# Create environment file if it doesn't exist
if (-not (Test-Path "backend\.env")) {
    Write-Host "📝 Creating environment file..." -ForegroundColor Yellow
    @"
# Environment Configuration
ENVIRONMENT=development
ADMIN_TOKEN=admin-secret-token
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost/newsense
"@ | Out-File -FilePath "backend\.env" -Encoding UTF8
}

Write-Host "`n✅ XAMPP Development Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost/newsense/" -ForegroundColor Cyan
Write-Host "🐍 Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "`n🚀 To start the backend server, run:" -ForegroundColor Yellow
Write-Host "   .\dev-backend-xampp.ps1" -ForegroundColor White
Write-Host "`n🔄 For frontend development with live reload:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
