# XAMPP Development Script for Python Backend
# This script sets up the Python backend to work with XAMPP

Write-Host "🐍 Setting up Python Backend for XAMPP..." -ForegroundColor Yellow

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

# Run type checking with mypy
Write-Host "🔍 Running type checking with mypy..." -ForegroundColor Yellow
mypy backend\ --config-file backend\mypy.ini

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Type checking found issues. Check the output above." -ForegroundColor Yellow
} else {
    Write-Host "✅ Type checking passed!" -ForegroundColor Green
}

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

# Start the backend server
Write-Host "🚀 Starting Python backend server..." -ForegroundColor Yellow
Write-Host "🌐 Backend API will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "🔄 Press Ctrl+C to stop the server" -ForegroundColor Cyan

# Start the FastAPI server
cd backend
python main.py
