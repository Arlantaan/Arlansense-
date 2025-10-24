# Sensation by Sanu - Modern E-commerce Platform

A modern, full-stack e-commerce platform built with React + TypeScript + Tailwind CSS frontend and Python + FastAPI backend.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **React Router** for navigation
- **Vanta.js** for 3D animations
- **Framer Motion** for animations
- **React Hook Form** for form handling
- **Axios** for API calls

### Backend
- **Python 3.11** with FastAPI
- **MyPy** for type checking
- **Pydantic** for data validation
- **SQLAlchemy** for database ORM
- **PostgreSQL** for database
- **Redis** for caching
- **Celery** for background tasks

### Deployment
- **Docker** containerization
- **Nginx** reverse proxy
- **Hetzner** cloud hosting
- **SSL/TLS** encryption

## Quick Start

### Frontend Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

### Backend Development
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn main:app --reload

# Type checking
mypy main.py
```

### Docker Deployment
```bash
# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down
```

## Features

- ✅ Modern React + TypeScript frontend
- ✅ Responsive design with Tailwind CSS
- ✅ Vanta.js 3D animations
- ✅ Shopping cart with localStorage
- ✅ FastAPI backend with type safety
- ✅ Docker containerization
- ✅ Nginx reverse proxy
- ✅ SSL/TLS security
- ✅ Hetzner cloud deployment ready

## Project Structure

```
├── src/                    # React frontend source
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── data/              # Static data
│   └── assets/            # Images and static assets
├── backend/               # Python backend
│   ├── main.py           # FastAPI application
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile        # Backend container
├── docker-compose.yml     # Multi-service deployment
├── nginx.conf            # Nginx configuration
└── package.json          # Frontend dependencies
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Backend
ENVIRONMENT=development
DATABASE_URL=postgresql://user:password@localhost:5432/sensation_db
REDIS_URL=redis://localhost:6379

# Frontend
VITE_API_URL=http://localhost:8000
```

## Deployment

The application is configured for deployment on Hetzner cloud with:
- Docker containers for all services
- Nginx reverse proxy with SSL
- PostgreSQL database
- Redis caching
- Automatic SSL certificate management

## License

© 2025 Sensation by Sanu • All rights reserved