# XAMPP Local Development Setup

## Current Setup
Your site is now configured to run locally on XAMPP at:
- **URL**: `http://localhost/newsense/`
- **Path**: `C:\xampp\htdocs\newsense\`

## Development Workflow

### 1. Local Development
```bash
# Start development server for live changes
npm run dev
# Access at: http://localhost:3000/
```

### 2. Build for XAMPP
```bash
# Build production version
npm run build

# Copy to XAMPP root
Copy-Item -Path "dist\*" -Destination "." -Recurse -Force

# Access at: http://localhost/newsense/
```

### 3. Deploy to Hetzner
```powershell
# Run deployment script
.\deploy-to-hetzner.ps1 -ServerIP "YOUR_HETZNER_IP" -Domain "yourdomain.com"
```

## File Structure
```
newsense/
├── src/                 # React source files
├── dist/               # Built files
├── assets/             # Static assets
├── index.html          # Main HTML file
├── .htaccess           # Apache configuration
├── deploy-to-hetzner.ps1  # Deployment script
└── xampp-config.md     # This file
```

## Features
- ✅ React Router support with .htaccess
- ✅ Gzip compression enabled
- ✅ Static asset caching
- ✅ Easy Hetzner deployment
- ✅ Development and production modes
