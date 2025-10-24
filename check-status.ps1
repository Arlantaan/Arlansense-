# Sensation by Sanu - Status Check Script

Write-Host "🚀 Sensation by Sanu - Development Server Status" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Check if Node.js processes are running
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -like "*node*"}
if ($nodeProcesses) {
    Write-Host "✅ Frontend (React + Vite): RUNNING" -ForegroundColor Green
    Write-Host "   Processes: $($nodeProcesses.Count)" -ForegroundColor Gray
} else {
    Write-Host "❌ Frontend (React + Vite): NOT RUNNING" -ForegroundColor Red
}

# Check if Python processes are running
$pythonProcesses = Get-Process | Where-Object {$_.ProcessName -like "*python*"}
if ($pythonProcesses) {
    Write-Host "✅ Backend (Python + FastAPI): RUNNING" -ForegroundColor Green
    Write-Host "   Processes: $($pythonProcesses.Count)" -ForegroundColor Gray
} else {
    Write-Host "❌ Backend (Python + FastAPI): NOT RUNNING" -ForegroundColor Red
}

Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White

Write-Host ""
Write-Host "📁 Project Structure:" -ForegroundColor Yellow
Write-Host "   Frontend: React + TypeScript + Tailwind CSS" -ForegroundColor White
Write-Host "   Backend: Python + FastAPI + MyPy" -ForegroundColor White
Write-Host "   Deployment: Docker + Nginx + Hetzner Ready" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "   2. Test the Vanta.js animations" -ForegroundColor White
Write-Host "   3. Try adding products to cart" -ForegroundColor White
Write-Host "   4. Check API endpoints at http://localhost:8000/docs" -ForegroundColor White
