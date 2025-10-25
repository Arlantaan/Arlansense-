#!/bin/bash
# Newsense Deployment Script for Hetzner Server

echo "🚀 Starting Newsense Deployment..."

# Check if we're on the server
if [ ! -f "/root/newsense/docker-compose-fixed.yml" ]; then
    echo "❌ Please run this script from /root/newsense directory on your Hetzner server"
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p certs
mkdir -p logs

# Copy environment file
echo "⚙️ Setting up environment..."
if [ ! -f ".env" ]; then
    cp .env.production .env
    echo "✅ Created .env file from .env.production"
    echo "⚠️  IMPORTANT: Edit .env file with your actual values before continuing!"
    echo "   - Update DB_PASSWORD, ADMIN_TOKEN, SECRET_KEY"
    echo "   - Update CORS_ORIGINS and VITE_API_URL with your domain"
    read -p "Press Enter after updating .env file..."
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose-fixed.yml down

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose-fixed.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "📊 Checking service status..."
docker-compose -f docker-compose-fixed.yml ps

# Test API
echo "🧪 Testing API..."
curl -f http://localhost/api/health || echo "❌ API not responding"

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at: http://YOUR_SERVER_IP"
echo "📚 API docs available at: http://YOUR_SERVER_IP/docs"
