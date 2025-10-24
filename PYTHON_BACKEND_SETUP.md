# Sensation by Sanu - Python Backend + XAMPP Setup

This project now includes a Python backend with FastAPI, mypy type checking, and XAMPP integration for development.

## 🚀 Quick Start

### 1. Complete XAMPP Development Setup
```powershell
npm run dev:xampp
```
This will:
- Build the frontend
- Copy files to XAMPP
- Set up Python virtual environment
- Install Python dependencies
- Run type checking with mypy

### 2. Start Backend Server
```powershell
npm run dev:backend
```
This will start the Python FastAPI server at `http://localhost:8000`

### 3. Test the API
```powershell
npm run test:api
```
This will test all API endpoints to ensure everything is working.

## 🐍 Python Backend Features

### Type Safety with MyPy
- Full type annotations throughout the codebase
- Strict type checking with mypy
- Pydantic models for data validation
- Type-safe API responses

### API Endpoints
- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /products` - Get all products
- `GET /products/{id}` - Get specific product
- `POST /contact` - Submit contact form
- `POST /orders` - Create new order
- `GET /orders/{id}` - Get order details
- `GET /admin/orders` - Get all orders (admin)
- `GET /admin/stats` - Get admin statistics (admin)

### Database
- File-based JSON database for development
- Easy to migrate to PostgreSQL/MySQL later
- Automatic data initialization

## 🔧 Development Workflow

### Frontend Development
```powershell
npm run dev:frontend
```
Starts Vite dev server with hot reload at `http://localhost:5173`

### Backend Development
```powershell
npm run dev:backend
```
Starts FastAPI server with auto-reload at `http://localhost:8000`

### Full Stack Development
```powershell
npm run dev:full
```
Runs both frontend and backend concurrently

## 📁 Project Structure

```
newsense/
├── backend/                 # Python FastAPI backend
│   ├── main.py             # Main application
│   ├── models.py           # Pydantic models
│   ├── database.py         # Database operations
│   ├── requirements.txt    # Python dependencies
│   ├── mypy.ini           # MyPy configuration
│   ├── pyproject.toml     # Python project config
│   └── .env.example       # Environment variables template
├── src/                    # React frontend
│   ├── lib/
│   │   └── api.ts         # API client
│   └── data/
│       └── products.ts    # Product data (now uses API)
├── dev-backend-xampp.ps1  # Backend development script
├── setup-xampp-dev.ps1    # Complete setup script
└── test-backend-api.ps1   # API testing script
```

## 🌐 Access Points

- **Frontend (XAMPP)**: http://localhost/newsense/
- **Frontend (Dev)**: http://localhost:5173/
- **Backend API**: http://localhost:8000/
- **API Documentation**: http://localhost:8000/docs
- **API ReDoc**: http://localhost:8000/redoc

## 🔒 Security

- Admin endpoints protected with Bearer token authentication
- CORS configured for development and production domains
- Input validation with Pydantic models
- Type-safe error handling

## 📦 Dependencies

### Python Backend
- FastAPI - Web framework
- Uvicorn - ASGI server
- Pydantic - Data validation
- MyPy - Type checking
- Python-dotenv - Environment variables

### Frontend
- React + TypeScript
- Vite - Build tool
- Axios - HTTP client
- Tailwind CSS - Styling

## 🚀 Production Migration

When ready to migrate from XAMPP to production:

1. **Database**: Replace file-based database with PostgreSQL/MySQL
2. **Authentication**: Implement proper JWT authentication
3. **Email**: Configure SendGrid or similar email service
4. **Payment**: Integrate Stripe for payments
5. **Deployment**: Use Docker containers or cloud services
6. **Environment**: Update CORS origins and other environment variables

## 🧪 Testing

The backend includes comprehensive API testing:
- Health check endpoint
- Product endpoints
- Contact form submission
- Order creation
- Admin endpoint security

Run tests with:
```powershell
npm run test:api
```

## 📝 Type Checking

Run mypy type checking:
```powershell
cd backend
mypy . --config-file mypy.ini
```

## 🔄 Development Tips

1. **Backend Changes**: The FastAPI server auto-reloads on file changes
2. **Frontend Changes**: Vite provides hot module replacement
3. **API Testing**: Use the interactive docs at `/docs` for testing
4. **Type Safety**: MyPy will catch type errors during development
5. **Database**: Data persists in `backend/data/` directory

## 🆘 Troubleshooting

### Backend won't start
- Check if Python 3.11+ is installed
- Ensure virtual environment is activated
- Verify all dependencies are installed

### API calls failing
- Check if backend is running on port 8000
- Verify CORS configuration
- Check browser console for errors

### Type checking errors
- Run `mypy . --config-file mypy.ini` to see specific errors
- Fix type annotations in the code
- Update mypy configuration if needed
