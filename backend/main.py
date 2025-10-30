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
from database_production import (
    get_db, create_tables, init_sample_data,
    get_products, get_product_by_id,
    create_order, get_all_orders, get_order_by_id, update_order,
    get_admin_stats
)
from sqlalchemy.orm import Session

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

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    create_tables()
    init_sample_data()

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
async def get_products_endpoint(db: Session = Depends(get_db)) -> List[Product]:
    """Get all products"""
    try:
        products = get_products(db)
        return [
            Product(
                id=str(p.id),
                name=p.name,
                price=p.price,
                image=p.image,
                description=p.description,
                tagline=p.tagline,
                fragrance_pyramid=p.fragrance_pyramid,
                in_stock=p.in_stock,
                quantity=p.quantity,
                category=p.category,
                created_at=p.created_at,
                updated_at=p.updated_at
            ) for p in products
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch products: {str(e)}"
        )

@app.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str, db: Session = Depends(get_db)) -> Product:
    """Get a specific product by ID"""
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return Product(
        id=str(product.id),
        name=product.name,
        price=product.price,
        image=product.image,
        description=product.description,
        tagline=product.tagline,
        fragrance_pyramid=product.fragrance_pyramid,
        in_stock=product.in_stock,
        quantity=product.quantity,
        category=product.category,
        created_at=product.created_at,
        updated_at=product.updated_at
    )

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
async def create_order_endpoint(
    order_data: OrderCreate,
    db: Session = Depends(get_db)
) -> APIResponse:
    """Create a new order"""
    try:
        # Generate temporary user_id (in production, get from auth)
        import uuid
        user_id = str(uuid.uuid4())
        
        # Create order using production database
        from database_production import create_order as db_create_order
        order = db_create_order(db, user_id, order_data)
        
        return APIResponse(
            message="Order created successfully",
            data={
                "order_id": str(order.id),
                "total": order.total,
                "status": order.status,
                "created_at": order.created_at.isoformat()
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )

@app.get("/orders/{order_id}", response_model=Order)
async def get_order_endpoint(order_id: str, db: Session = Depends(get_db)) -> Order:
    """Get order by ID"""
    order = get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    # Convert to Order model
    return Order(
        id=str(order.id),
        user_id=str(order.user_id),
        items=[],  # TODO: Populate with order items
        total=order.total,
        status=OrderStatus(order.status),
        shipping_address=order.shipping_address,
        payment_method=PaymentMethod(order.payment_method),
        created_at=order.created_at,
        updated_at=order.updated_at,
        tracking_number=order.tracking_number
    )

@app.put("/orders/{order_id}", response_model=Order)
async def update_order_endpoint(
    order_id: str, 
    order_update: OrderUpdate,
    is_admin: bool = Depends(verify_admin_token),
    db: Session = Depends(get_db)
) -> Order:
    """Update an order (admin only)"""
    try:
        from database_production import update_order as db_update_order
        updated_order = db_update_order(db, order_id, order_update)
        
        if not updated_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        return Order(
            id=str(updated_order.id),
            user_id=str(updated_order.user_id),
            items=[],
            total=updated_order.total,
            status=OrderStatus(updated_order.status),
            shipping_address=updated_order.shipping_address,
            payment_method=PaymentMethod(updated_order.payment_method),
            created_at=updated_order.created_at,
            updated_at=updated_order.updated_at,
            tracking_number=updated_order.tracking_number
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update order: {str(e)}"
        )

# Admin routes (protected)
@app.get("/admin/orders", response_model=List[Order])
async def get_all_orders_endpoint(
    is_admin: bool = Depends(verify_admin_token),
    db: Session = Depends(get_db)
) -> List[Order]:
    """Get all orders (admin only)"""
    try:
        orders = get_all_orders(db)
        return [
            Order(
                id=str(o.id),
                user_id=str(o.user_id),
                items=[],
                total=o.total,
                status=OrderStatus(o.status),
                shipping_address=o.shipping_address,
                payment_method=PaymentMethod(o.payment_method),
                created_at=o.created_at,
                updated_at=o.updated_at,
                tracking_number=o.tracking_number
            ) for o in orders
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch orders: {str(e)}"
        )

@app.get("/admin/stats", response_model=AdminStats)
async def get_admin_stats_endpoint(
    is_admin: bool = Depends(verify_admin_token),
    db: Session = Depends(get_db)
) -> AdminStats:
    """Get admin statistics"""
    try:
        stats = get_admin_stats(db)
        # Convert recent_orders to Order models
        recent_orders = [
            Order(
                id=str(o.id),
                user_id=str(o.user_id),
                items=[],
                total=o.total,
                status=OrderStatus(o.status),
                shipping_address=o.shipping_address,
                payment_method=PaymentMethod(o.payment_method),
                created_at=o.created_at,
                updated_at=o.updated_at,
                tracking_number=o.tracking_number
            ) for o in stats.get('recent_orders', [])
        ]
        return AdminStats(
            total_orders=stats['total_orders'],
            total_revenue=stats['total_revenue'],
            pending_orders=stats['pending_orders'],
            total_products=stats['total_products'],
            active_users=stats['active_users'],
            monthly_revenue=stats['monthly_revenue'],
            low_stock_products=stats.get('low_stock_products', 0),
            recent_orders=recent_orders
        )
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
