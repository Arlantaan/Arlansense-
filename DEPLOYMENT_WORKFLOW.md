# Deployment Workflow

## Update Process:

### 1. Local Development
- Make changes locally in C:\xampp\htdocs\newsense
- Test changes thoroughly

### 2. Commit to GitHub
`ash
git add .
git commit -m 'Your update description'
git push origin master
`

### 3. Deploy to Hetzner Server
`ash
# SSH into server
ssh root@91.98.39.86

# Pull latest code
cd /root/newsense
git pull origin master

# If frontend changed, rebuild
npm run build
mv dist /var/www/newsense
chown -R www-data:www-data /var/www/newsense

# If backend changed, restart containers
docker-compose down
docker-compose up -d --build

# Check status
curl http://localhost
docker-compose ps
`

## Quick Update Script (Save on server):
`ash
#!/bin/bash
cd /root/newsense
git pull origin master
npm run build
mv dist /var/www/newsense
chown -R www-data:www-data /var/www/newsense
docker-compose restart backend
echo 'Deployment complete!'
`

This is your deployment workflow going forward!
