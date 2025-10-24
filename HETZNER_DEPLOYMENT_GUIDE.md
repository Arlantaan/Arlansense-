# 🚀 Hetzner CPX11 Deployment Guide

## Timeline: 2-3 hours to LIVE

---

## Step 1: Create Hetzner Server (5 minutes)

### 1.1 Create Account
- Go to https://www.hetzner.com/cloud
- Sign up with email
- Add payment method

### 1.2 Create Server
1. Click "Create" → "New Server"
2. Choose:
   - **Location**: Closest to your users (EU-Central recommended)
   - **OS**: Ubuntu 22.04
   - **Type**: CPX11 (€2.49/month)
   - **Volume**: None needed
3. Click "Create & Buy"
4. **Copy your server IP address** (you'll need it)

---

## Step 2: Connect to Server (5 minutes)

### 2.1 SSH Access
```bash
# Windows - Use PowerShell
ssh root@YOUR_SERVER_IP

# Mac/Linux
ssh root@YOUR_SERVER_IP
```

### 2.2 Verify Connection
```bash
# You should see the prompt: root@sensation:~#
uname -a  # Should show Ubuntu
```

---

## Step 3: Install Docker (10 minutes)

### 3.1 Install Docker & Docker Compose
```bash
# Update system
apt-get update && apt-get upgrade -y

# Install Docker
apt-get install -y docker.io docker-compose

# Add user to docker group (optional)
usermod -aG docker root

# Verify installation
docker --version
docker-compose --version
```

---

## Step 4: Clone Your Repository (5 minutes)

### 4.1 Clone Code
```bash
# Install git
apt-get install -y git

# Clone your repository
cd /root
git clone https://github.com/YOUR_USERNAME/newsense.git
cd newsense
```

### 4.2 Verify Files
```bash
# Check if docker-compose.yml exists
ls -la | grep docker-compose
```

---

## Step 5: Set Up Environment Variables (5 minutes)

### 5.1 Create .env File
```bash
# Copy the production environment file
cp .env.production .env

# Edit the file
nano .env
```

### 5.2 Update These Values:
```env
# Change these:
DB_PASSWORD=changeme123  → DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE
VITE_API_URL=http://localhost:8000  → VITE_API_URL=http://YOUR_DOMAIN.com/api
CORS_ORIGINS=http://localhost  → CORS_ORIGINS=http://YOUR_DOMAIN.com
SECRET_KEY=your-secret-key-change-this  → SECRET_KEY=RANDOM_SECRET_STRING
ADMIN_TOKEN=admin-secret-token  → ADMIN_TOKEN=YOUR_ADMIN_TOKEN
```

### 5.3 Generate Random Strings
```bash
# Generate random password
openssl rand -base64 32

# Generate random secret
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 5.4 Save File
Press `Ctrl+X`, then `Y`, then `Enter` to save

---

## Step 6: Build and Start Containers (20-30 minutes)

### 6.1 Build Images
```bash
# This will take 10-15 minutes (first time)
docker-compose build
```

### 6.2 Start Services
```bash
# Start all containers in background
docker-compose up -d

# Watch the logs
docker-compose logs -f
```

### 6.3 Wait for Services to Start
```bash
# Check status
docker-compose ps

# Should show all containers as "Up"
# backend, frontend, postgres, redis, nginx
```

---

## Step 7: Test Your App (5 minutes)

### 7.1 Test Backend
```bash
# Get your server IP
curl http://YOUR_SERVER_IP:8000/health

# Should return: {"success":true,"message":"API is healthy","data":{"status":"healthy","timestamp":"..."}
```

### 7.2 Test Frontend
```bash
# Open browser
http://YOUR_SERVER_IP

# You should see your Sensation by Sanu website!
```

### 7.3 Test Database
```bash
# Connect to PostgreSQL
docker exec -it sensation_postgres psql -U sensation -d sensation_db

# Run a simple query
\dt  # List tables (should be empty at first)
\q   # Exit
```

---

## Step 8: Set Up Domain Name (10 minutes)

### 8.1 Point Domain to Server
1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Find "DNS Settings"
3. Add/Edit A record:
   - **Name**: @
   - **Type**: A
   - **Value**: YOUR_SERVER_IP
   - **TTL**: 3600

### 8.2 Wait for DNS Propagation
```bash
# Check DNS propagation (wait up to 15 minutes)
nslookup your-domain.com

# Should eventually show your server IP
```

---

## Step 9: Set Up SSL Certificate (15 minutes)

### 9.1 Install Certbot
```bash
apt-get install -y certbot python3-certbot-nginx
```

### 9.2 Generate Certificate
```bash
# Replace with your domain
certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Answer prompts:
# - Email: your-email@example.com
# - Accept terms: Y
# - Share email: N (optional)
```

### 9.3 Copy Certificates
```bash
# Create certs directory
mkdir -p /root/newsense/certs

# Copy certificates
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /root/newsense/certs/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem /root/newsense/certs/
```

### 9.4 Update Nginx Config
```bash
# Edit nginx.conf
nano /root/newsense/nginx.conf

# Uncomment these lines:
# - HTTP to HTTPS redirect
# - HTTPS server block
# - SSL certificate paths

# Save and exit (Ctrl+X, Y, Enter)
```

### 9.5 Reload Nginx
```bash
docker-compose restart nginx
```

### 9.6 Test HTTPS
```bash
# Open browser
https://your-domain.com

# Should work! Green lock icon ✓
```

---

## Step 10: Verify Everything (5 minutes)

### 10.1 Frontend
```bash
# Should load your website
https://your-domain.com
```

### 10.2 API Documentation
```bash
# Should show API docs
https://your-domain.com/docs
```

### 10.3 Health Check
```bash
# Should return healthy status
curl https://your-domain.com/api/health
```

### 10.4 Products Endpoint
```bash
# Should return your products
curl https://your-domain.com/api/products
```

---

## 🎉 YOU'RE LIVE!

Your app is now running on Hetzner CPX11!

---

## Maintenance Commands

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop Services
```bash
docker-compose down
```

### Start Services
```bash
docker-compose up -d
```

### Update Code
```bash
# Pull latest changes
git pull

# Rebuild
docker-compose build

# Restart
docker-compose up -d
```

### Database Backup
```bash
# Backup PostgreSQL
docker exec sensation_postgres pg_dump -U sensation sensation_db > backup.sql

# Restore
docker exec -i sensation_postgres psql -U sensation sensation_db < backup.sql
```

---

## Troubleshooting

### Container won't start
```bash
docker-compose logs backend  # Check error message
docker-compose down          # Stop all
docker-compose up -d         # Start again
```

### Out of memory
```bash
# CPX11 has 2GB RAM - should be fine
# If issues, stop less-used services
docker-compose stop redis    # Stop Redis cache temporarily
```

### Domain not resolving
```bash
# Check DNS
nslookup your-domain.com

# Wait 15-30 minutes for propagation
# Clear local DNS cache if needed
```

### SSL certificate issues
```bash
# Check certificate validity
openssl x509 -in /root/newsense/certs/fullchain.pem -text -noout

# Renew certificate (do this monthly)
certbot renew
```

---

## Next Steps

### Add More Features
- Implement JWT authentication
- Add Stripe payments
- Set up email notifications

### Monitor Performance
```bash
# Check server resources
docker stats

# Check disk usage
df -h

# Check memory usage
free -h
```

### Scale Up
When you outgrow CPX11:
- Upgrade to CCX13 (€9.90/month)
- Add separate database server
- Set up CDN for static files

---

## 📞 Support

- **Docker Issues**: `docker --help`
- **Hetzner Help**: https://docs.hetzner.cloud
- **FastAPI**: https://fastapi.tiangolo.com
- **React**: https://react.dev

**Congratulations! Your Sensation by Sanu app is LIVE! 🎉**
