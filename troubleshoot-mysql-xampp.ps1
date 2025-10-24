# XAMPP MySQL Troubleshooting Script
# This script helps diagnose and fix common MySQL startup issues

Write-Host "🔧 XAMPP MySQL Troubleshooting" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

# Check if XAMPP is installed
Write-Host "`n📁 Checking XAMPP installation..." -ForegroundColor Yellow
$xamppPath = "C:\xampp"
if (Test-Path $xamppPath) {
    Write-Host "✅ XAMPP found at: $xamppPath" -ForegroundColor Green
} else {
    Write-Host "❌ XAMPP not found at default location!" -ForegroundColor Red
    Write-Host "   Please check your XAMPP installation path" -ForegroundColor Yellow
    exit 1
}

# Check MySQL data directory
Write-Host "`n🗄️  Checking MySQL data directory..." -ForegroundColor Yellow
$mysqlDataPath = "$xamppPath\mysql\data"
if (Test-Path $mysqlDataPath) {
    Write-Host "✅ MySQL data directory exists" -ForegroundColor Green
    
    # Check for common problematic files
    $problemFiles = @("ib_logfile0", "ib_logfile1", "ibdata1")
    foreach ($file in $problemFiles) {
        $filePath = "$mysqlDataPath\$file"
        if (Test-Path $filePath) {
            $fileSize = (Get-Item $filePath).Length
            Write-Host "   📄 $file exists (Size: $([math]::Round($fileSize/1MB, 2)) MB)" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "❌ MySQL data directory not found!" -ForegroundColor Red
    Write-Host "   Path: $mysqlDataPath" -ForegroundColor Yellow
}

# Check for port conflicts
Write-Host "`n🔌 Checking for port conflicts..." -ForegroundColor Yellow
$ports = @(3306, 3307, 3308)
foreach ($port in $ports) {
    $portCheck = netstat -ano | findstr ":$port "
    if ($portCheck) {
        Write-Host "⚠️  Port $port is in use:" -ForegroundColor Yellow
        Write-Host "   $portCheck" -ForegroundColor Cyan
    } else {
        Write-Host "✅ Port $port is available" -ForegroundColor Green
    }
}

# Check MySQL service status
Write-Host "`n⚙️  Checking MySQL service status..." -ForegroundColor Yellow
try {
    $mysqlService = Get-Service -Name "mysql" -ErrorAction SilentlyContinue
    if ($mysqlService) {
        Write-Host "📋 MySQL Service Status: $($mysqlService.Status)" -ForegroundColor Cyan
        if ($mysqlService.Status -eq "Running") {
            Write-Host "⚠️  MySQL service is running - this might conflict with XAMPP" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✅ No MySQL service found (good for XAMPP)" -ForegroundColor Green
    }
} catch {
    Write-Host "✅ No MySQL service found (good for XAMPP)" -ForegroundColor Green
}

# Check for common MySQL processes
Write-Host "`n🔍 Checking for MySQL processes..." -ForegroundColor Yellow
$mysqlProcesses = Get-Process -Name "mysqld" -ErrorAction SilentlyContinue
if ($mysqlProcesses) {
    Write-Host "⚠️  MySQL processes found:" -ForegroundColor Yellow
    foreach ($process in $mysqlProcesses) {
        Write-Host "   PID: $($process.Id) - $($process.ProcessName)" -ForegroundColor Cyan
    }
} else {
    Write-Host "✅ No MySQL processes running" -ForegroundColor Green
}

# Check MySQL error log
Write-Host "`n📋 Checking MySQL error log..." -ForegroundColor Yellow
$errorLogPath = "$xamppPath\mysql\data\*.err"
$errorLogs = Get-ChildItem $errorLogPath -ErrorAction SilentlyContinue
if ($errorLogs) {
    $latestLog = $errorLogs | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    Write-Host "📄 Latest error log: $($latestLog.Name)" -ForegroundColor Cyan
    Write-Host "   Last modified: $($latestLog.LastWriteTime)" -ForegroundColor Cyan
    
    # Show last few lines of error log
    Write-Host "`n🔍 Recent error log entries:" -ForegroundColor Yellow
    $logContent = Get-Content $latestLog.FullName -Tail 10
    foreach ($line in $logContent) {
        if ($line -match "ERROR|FATAL|CRITICAL") {
            Write-Host "   ❌ $line" -ForegroundColor Red
        } elseif ($line -match "WARNING") {
            Write-Host "   ⚠️  $line" -ForegroundColor Yellow
        } else {
            Write-Host "   ℹ️  $line" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "❌ No MySQL error logs found" -ForegroundColor Red
}

Write-Host "`n🛠️  Common Solutions:" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow
Write-Host "1. 🔄 Restart XAMPP Control Panel as Administrator" -ForegroundColor Cyan
Write-Host "2. 🗑️  Delete problematic files (ib_logfile0, ib_logfile1, ibdata1)" -ForegroundColor Cyan
Write-Host "3. 🔧 Change MySQL port in XAMPP configuration" -ForegroundColor Cyan
Write-Host "4. 🛑 Stop any running MySQL services" -ForegroundColor Cyan
Write-Host "5. 🔄 Reinstall XAMPP if issues persist" -ForegroundColor Cyan

Write-Host "`n🚀 Quick Fix Commands:" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow
Write-Host "To try automatic fixes, run:" -ForegroundColor Cyan
Write-Host "   .\fix-mysql-xampp.ps1" -ForegroundColor White
