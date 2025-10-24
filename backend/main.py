"""
Sensation by Sanu - Backend API
FastAPI application with Python + MyPy type checking
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional, Dict, Any
import uvicorn
from datetime import datetime
import os
import uuid
from dotenv import load_dotenv

# Import our models and database
from models import (
    Product, Order, User, ContactForm, OrderCreate, OrderUpdate, 
    UserCreate, UserUpdate, AdminStats, APIResponse, ErrorResponse,
    OrderStatus, PaymentMethod
)
from database import db

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Sensation by Sanu API",
    description="Backend API for Sensation by Sanu perfume boutique",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173",  # Vite dev server
        "http://localhost/newsense",  # XAMPP
        "https://sensationbysanu.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Utility functions
def generate_id() -> str:
    """Generate a unique ID"""
    return str(uuid.uuid4())

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> bool:
    """Verify admin token (placeholder implementation)"""
    # In production, implement proper JWT verification
    admin_token = os.getenv("ADMIN_TOKEN", "admin-secret-token")
    return credentials.credentials == admin_token

# Routes
@app.get("/", response_model=APIResponse)
async def root() -> APIResponse:
    """Root endpoint"""
    return APIResponse(
        message="Sensation by Sanu API",
        data={"version": "1.0.0", "status": "running"}
    )

@app.get("/health", response_model=APIResponse)
async def health_check() -> APIResponse:
    """Health check endpoint"""
    return APIResponse(
        message="API is healthy",
        data={"timestamp": datetime.utcnow(), "status": "healthy"}
    )

@app.get("/products", response_model=List[Product])
async def get_products() -> List[Product]:
    """Get all products"""
    try:
        return db.get_products()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch products: {str(e)}"
        )

@app.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str) -> Product:
    """Get a specific product by ID"""
    product = db.get_product(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@app.post("/contact", response_model=APIResponse)
async def submit_contact_form(contact: ContactForm) -> APIResponse:
    """Submit contact form"""
    try:
        # Here you would integrate with your email service (SendGrid, etc.)
        # For now, just log the contact form submission
        print(f"Contact form submitted: {contact.name} - {contact.email}")
        
        return APIResponse(
            message="Contact form submitted successfully",
            data={"submitted_at": datetime.utcnow()}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit contact form: {str(e)}"
        )

@app.post("/orders", response_model=APIResponse)
async def create_order(order_data: OrderCreate) -> APIResponse:
    """Create a new order"""
    try:
        # Generate order ID and user ID (in production, get from auth)
        order_id = generate_id()
        user_id = generate_id()  # Placeholder - should come from authentication
        
        # Calculate total
        total = 0
        for item in order_data.items:
            product = db.get_product(item.product_id)
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product {item.product_id} not found"
                )
            total += product.price * item.quantity
        
        # Create order
        order = Order(
            id=order_id,
            user_id=user_id,
            items=order_data.items,
            total=total,
            shipping_address=order_data.shipping_address,
            payment_method=order_data.payment_method
        )
        
        # Save to database
        created_order = db.create_order(order)
        
        return APIResponse(
            message="Order created successfully",
            data={"order_id": created_order.id, "total": created_order.total}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )

@app.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str) -> Order:
    """Get order by ID"""
    order = db.get_order(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return order

@app.put("/orders/{order_id}", response_model=Order)
async def update_order(
    order_id: str, 
    order_update: OrderUpdate,
    is_admin: bool = Depends(verify_admin_token)
) -> Order:
    """Update an order (admin only)"""
    try:
        updates = order_update.dict(exclude_unset=True)
        updated_order = db.update_order(order_id, updates)
        
        if not updated_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        return updated_order
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update order: {str(e)}"
        )

# Admin routes (protected)
@app.get("/admin/orders", response_model=List[Order])
async def get_all_orders(
    is_admin: bool = Depends(verify_admin_token)
) -> List[Order]:
    """Get all orders (admin only)"""
    try:
        return db.get_orders()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch orders: {str(e)}"
        )

@app.get("/admin/stats", response_model=AdminStats)
async def get_admin_stats(
    is_admin: bool = Depends(verify_admin_token)
) -> AdminStats:
    """Get admin statistics"""
    try:
        stats_data = db.get_admin_stats()
        return AdminStats(**stats_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch admin stats: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if os.getenv("ENVIRONMENT") == "development" else False
    )
