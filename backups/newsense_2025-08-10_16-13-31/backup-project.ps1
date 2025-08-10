# Newsense Project Backup Script (PowerShell)
# Run this script as Administrator for best results

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Newsense Project Backup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set project directory
$PROJECT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKUP_DATE = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BACKUP_DIR = Join-Path $PROJECT_DIR "backups\newsense_$BACKUP_DATE"

# Create backup directory
if (!(Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null
}

Write-Host "Creating backup in: $BACKUP_DIR" -ForegroundColor Green
Write-Host ""

# Copy project files (excluding unnecessary files)
Write-Host "Copying project files..." -ForegroundColor Yellow

# Define files to exclude
$excludePatterns = @(
    "backups\*",
    "node_modules\*",
    ".git\*",
    "*.log",
    "*.tmp",
    "*.cache",
    ".DS_Store",
    "Thumbs.db",
    "*.zip",
    "*.rar",
    "*.7z"
)

# Copy files with exclusions
Get-ChildItem -Path $PROJECT_DIR -Recurse | Where-Object {
    $exclude = $false
    foreach ($pattern in $excludePatterns) {
        if ($_.FullName -like "*\$pattern") {
            $exclude = $true
            break
        }
    }
    return -not $exclude
} | ForEach-Object {
    $relativePath = $_.FullName.Substring($PROJECT_DIR.Length + 1)
    $destination = Join-Path $BACKUP_DIR $relativePath
    
    if ($_.PSIsContainer) {
        if (!(Test-Path $destination)) {
            New-Item -ItemType Directory -Path $destination -Force | Out-Null
        }
    } else {
        $destinationDir = Split-Path -Parent $destination
        if (!(Test-Path $destinationDir)) {
            New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
        }
        Copy-Item $_.FullName -Destination $destination -Force
    }
}

# Create backup info file
Write-Host "Creating backup info..." -ForegroundColor Yellow
$backupInfo = @"
Backup created: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Project: Newsense
Version: Latest
Features:
- Contact form with Firestore integration
- Admin panel with contacts management
- Product catalog and cart system
- Firebase authentication
- Responsive design and animations
- Order management system
- User management system

Backup location: $BACKUP_DIR
"@

$backupInfo | Out-File -FilePath (Join-Path $BACKUP_DIR "BACKUP_INFO.txt") -Encoding UTF8

# Create compressed backup
Write-Host "Creating compressed backup..." -ForegroundColor Yellow
$zipPath = Join-Path $PROJECT_DIR "backups\newsense_$BACKUP_DATE.zip"

# Remove existing zip if it exists
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path $BACKUP_DIR -DestinationPath $zipPath -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Backup completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backup location: $BACKUP_DIR" -ForegroundColor White
Write-Host "Compressed backup: $zipPath" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Upload to GitHub" -ForegroundColor White
Write-Host "2. Copy to cloud storage (Google Drive, OneDrive, etc.)" -ForegroundColor White
Write-Host "3. Copy to external hard drive" -ForegroundColor White
Write-Host "4. Copy to another computer" -ForegroundColor White
Write-Host ""

# Open backup folder
Write-Host "Opening backup folder..." -ForegroundColor Yellow
Start-Process $BACKUP_DIR

Read-Host "Press Enter to continue"
