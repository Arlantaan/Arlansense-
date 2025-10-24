# Quick MySQL Fix for XAMPP
# This script attempts common fixes for MySQL startup issues

Write-Host "🔧 Quick MySQL Fix for XAMPP" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow

$xamppPath = "C:\xampp"
$mysqlDataPath = "$xamppPath\mysql\data"

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "⚠️  Not running as administrator. Some fixes may not work." -ForegroundColor Yellow
    Write-Host "   Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Cyan
}

# Fix 1: Stop any running MySQL processes
Write-Host "`n🛑 Stopping MySQL processes..." -ForegroundColor Yellow
try {
    Stop-Process -Name "mysqld" -Force -ErrorAction SilentlyContinue
    Write-Host "✅ MySQL processes stopped" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  No MySQL processes to stop" -ForegroundColor Cyan
}

# Fix 2: Stop MySQL service if running
Write-Host "`n⚙️  Stopping MySQL service..." -ForegroundColor Yellow
try {
    $mysqlService = Get-Service -Name "mysql" -ErrorAction SilentlyContinue
    if ($mysqlService -and $mysqlService.Status -eq "Running") {
        Stop-Service -Name "mysql" -Force
        Write-Host "✅ MySQL service stopped" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  MySQL service not running" -ForegroundColor Cyan
    }
} catch {
    Write-Host "ℹ️  No MySQL service found" -ForegroundColor Cyan
}

# Fix 3: Backup and remove problematic files
Write-Host "`n🗑️  Cleaning MySQL data files..." -ForegroundColor Yellow
$problemFiles = @("ib_logfile0", "ib_logfile1", "ibdata1")
$backupDir = "$mysqlDataPath\backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

if (Test-Path $mysqlDataPath) {
    # Create backup directory
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    foreach ($file in $problemFiles) {
        $filePath = "$mysqlDataPath\$file"
        if (Test-Path $filePath) {
            try {
                # Backup the file
                Copy-Item $filePath "$backupDir\$file" -Force
                Write-Host "📄 Backed up: $file" -ForegroundColor Cyan
                
                # Remove the problematic file
                Remove-Item $filePath -Force
                Write-Host "🗑️  Removed: $file" -ForegroundColor Green
            } catch {
                Write-Host "❌ Failed to remove: $file - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}

# Fix 4: Check and fix MySQL configuration
Write-Host "`n🔧 Checking MySQL configuration..." -ForegroundColor Yellow
$myIniPath = "$xamppPath\mysql\bin\my.ini"
if (Test-Path $myIniPath) {
    Write-Host "✅ MySQL config file found" -ForegroundColor Green
    
    # Check for port conflicts in config
    $configContent = Get-Content $myIniPath
    $portLine = $configContent | Where-Object { $_ -match "port\s*=" }
    if ($portLine) {
        Write-Host "📋 Current port setting: $portLine" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ MySQL config file not found" -ForegroundColor Red
}

# Fix 5: Reset MySQL root password (if needed)
Write-Host "`n🔑 Resetting MySQL root password..." -ForegroundColor Yellow
$resetScript = @"
UPDATE mysql.user SET authentication_string = PASSWORD('') WHERE User = 'root';
FLUSH PRIVILEGES;
"@

$resetScript | Out-File -FilePath "$mysqlDataPath\reset_password.sql" -Encoding UTF8
Write-Host "📄 Created password reset script" -ForegroundColor Cyan

Write-Host "`n✅ Quick fixes applied!" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host "`n🚀 Next steps:" -ForegroundColor Yellow
Write-Host "1. Close XAMPP Control Panel completely" -ForegroundColor Cyan
Write-Host "2. Right-click XAMPP Control Panel and 'Run as Administrator'" -ForegroundColor Cyan
Write-Host "3. Try starting MySQL again" -ForegroundColor Cyan
Write-Host "4. If still failing, check the error logs" -ForegroundColor Cyan

Write-Host "`n📋 Alternative solutions:" -ForegroundColor Yellow
Write-Host "• Change MySQL port to 3307 in XAMPP config" -ForegroundColor Cyan
Write-Host "• Use MariaDB instead of MySQL" -ForegroundColor Cyan
Write-Host "• Reinstall XAMPP completely" -ForegroundColor Cyan

Write-Host "`n🔍 To check logs:" -ForegroundColor Yellow
Write-Host "   Click 'Logs' button next to MySQL in XAMPP Control Panel" -ForegroundColor Cyan
