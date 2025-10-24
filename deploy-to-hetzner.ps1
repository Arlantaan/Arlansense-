# Deployment script for Hetzner Cloud
# This script will help you deploy your site to Hetzner

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$true)]
    [string]$Username = "root",
    
    [Parameter(Mandatory=$false)]
    [string]$Domain = ""
)

Write-Host "🚀 Deploying Sensation by Sanu to Hetzner Cloud..." -ForegroundColor Green

# Build the project
Write-Host "📦 Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Create deployment package
Write-Host "📁 Creating deployment package..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$packageName = "newsense-deploy-$timestamp.zip"

# Create temp directory
$tempDir = "temp-deploy"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# Copy files to temp directory
Copy-Item -Path "dist\*" -Destination $tempDir -Recurse -Force
Copy-Item -Path ".htaccess" -Destination $tempDir -Force

# Create zip package
Compress-Archive -Path "$tempDir\*" -DestinationPath $packageName -Force

# Clean up temp directory
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "✅ Deployment package created: $packageName" -ForegroundColor Green

# Upload to server (you'll need to run this manually or set up SSH keys)
Write-Host "📤 Upload commands for Hetzner:" -ForegroundColor Cyan
Write-Host "scp $packageName $Username@$ServerIP:/var/www/html/" -ForegroundColor White
Write-Host "ssh $Username@$ServerIP 'cd /var/www/html && unzip -o $packageName && rm $packageName'" -ForegroundColor White

if ($Domain) {
    Write-Host "🌐 Domain setup commands:" -ForegroundColor Cyan
    Write-Host "sudo certbot --nginx -d $Domain" -ForegroundColor White
}

Write-Host "🎉 Deployment package ready!" -ForegroundColor Green
Write-Host "Run the upload commands above to deploy to your Hetzner server." -ForegroundColor Yellow
