# Quick Setup Test
# This script verifies the Python backend setup

Write-Host "🧪 Testing Python Backend Setup..." -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow

# Check Python installation
Write-Host "`n🐍 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found!" -ForegroundColor Red
    Write-Host "   Please install Python 3.11+ from https://www.python.org/downloads/" -ForegroundColor Cyan
    exit 1
}

# Check if virtual environment exists
Write-Host "`n📦 Checking virtual environment..." -ForegroundColor Yellow
if (Test-Path "backend\.venv") {
    Write-Host "✅ Virtual environment exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Virtual environment not found" -ForegroundColor Yellow
    Write-Host "   Run: npm run dev:xampp to create it" -ForegroundColor Cyan
}

# Check if requirements.txt exists
Write-Host "`n📋 Checking requirements file..." -ForegroundColor Yellow
if (Test-Path "backend\requirements.txt") {
    Write-Host "✅ Requirements file exists" -ForegroundColor Green
} else {
    Write-Host "❌ Requirements file not found!" -ForegroundColor Red
    exit 1
}

# Check if main.py exists
Write-Host "`n📄 Checking main application..." -ForegroundColor Yellow
if (Test-Path "backend\main.py") {
    Write-Host "✅ Main application exists" -ForegroundColor Green
} else {
    Write-Host "❌ Main application not found!" -ForegroundColor Red
    exit 1
}

# Check if models.py exists
Write-Host "`n🏗️  Checking models..." -ForegroundColor Yellow
if (Test-Path "backend\models.py") {
    Write-Host "✅ Models file exists" -ForegroundColor Green
} else {
    Write-Host "❌ Models file not found!" -ForegroundColor Red
    exit 1
}

# Check if database.py exists
Write-Host "`n🗄️  Checking database..." -ForegroundColor Yellow
if (Test-Path "backend\database.py") {
    Write-Host "✅ Database file exists" -ForegroundColor Green
} else {
    Write-Host "❌ Database file not found!" -ForegroundColor Red
    exit 1
}

# Check if mypy configuration exists
Write-Host "`n🔍 Checking mypy configuration..." -ForegroundColor Yellow
if (Test-Path "backend\mypy.ini") {
    Write-Host "✅ MyPy configuration exists" -ForegroundColor Green
} else {
    Write-Host "❌ MyPy configuration not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Setup Verification Complete!" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host "✅ All required files are present" -ForegroundColor Green
Write-Host "`n🚀 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Run: npm run dev:xampp" -ForegroundColor Cyan
Write-Host "   2. Then: npm run dev:backend" -ForegroundColor Cyan
Write-Host "   3. Test: npm run test:api" -ForegroundColor Cyan
Write-Host "`n📚 Documentation: PYTHON_BACKEND_SETUP.md" -ForegroundColor Cyan
