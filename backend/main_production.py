"""
Sensation by Sanu - Production Backend API
Complete e-commerce platform with authentication, admin dashboard, and business intelligence
"""

from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
import uvicorn
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session

# Import our models and database
from models import (
    Product, Order, User, ContactForm, OrderCreate, OrderUpdate, 
    UserCreate, UserUpdate, UserLogin, Token, PasswordChange,
    AdminStats, APIResponse, ErrorResponse, ProductCreate, ProductUpdate,
    OrderStatus, PaymentMethod
)
from database_production import (
    get_db, create_tables, init_sample_data,
    create_user, authenticate_user, get_user_by_email, get_user_by_id,
    create_product, get_products, get_product_by_id, update_product, delete_product,
    create_order, get_orders_by_user, get_all_orders, get_order_by_id, update_order,
    get_admin_stats, create_contact,
    create_access_token, verify_token, get_password_hash, verify_password
)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Sensation by Sanu API",
    description="Production e-commerce platform for Sensation by Sanu perfume boutique",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Initialize database
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    create_tables()
    init_sample_data()

# Authentication dependencies
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

async def get_admin_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current admin user"""
    user = await get_current_user(credentials, db)
    
    # Check if user is admin (you can implement role-based access)
    admin_token = os.getenv("ADMIN_TOKEN", "MyAdminToken123!")
    if credentials.credentials == admin_token:
        return user
    
    # For now, check if user email is admin
    if user.email == "admin@sensationbysanu.com":
        return user
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin access required"
    )

# Routes
@app.get("/", response_model=APIResponse)
async def root() -> APIResponse:
    """Root endpoint"""
    return APIResponse(
        message="Sensation by Sanu API",
        data={"version": "2.0.0", "status": "running", "environment": "production"}
    )

@app.get("/health", response_model=APIResponse)
async def health_check() -> APIResponse:
    """Health check endpoint"""
    return APIResponse(
        message="API is healthy",
        data={"timestamp": datetime.utcnow(), "status": "healthy"}
    )

# Authentication routes
@app.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)) -> Token:
    """Register a new user"""
    # Check if user already exists
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    db_user = create_user(db, user_data)
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(db_user.id)}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=1800,  # 30 minutes
        user=User(
            id=str(db_user.id),
            email=db_user.email,
            name=db_user.name,
            phone=db_user.phone,
            is_active=db_user.is_active,
            created_at=db_user.created_at,
            updated_at=db_user.updated_at
        )
    )

@app.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)) -> Token:
    """Login user"""
    user = authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=1800,  # 30 minutes
        user=User(
            id=str(user.id),
            email=user.email,
            name=user.name,
            phone=user.phone,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    )

@app.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)) -> User:
    """Get current user information"""
    return current_user

@app.put("/auth/profile", response_model=User)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> User:
    """Update user profile"""
    # Update user in database
    db_user = get_user_by_id(db, current_user.id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_user)
    
    return User(
        id=str(db_user.id),
        email=db_user.email,
        name=db_user.name,
        phone=db_user.phone,
        is_active=db_user.is_active,
        created_at=db_user.created_at,
        updated_at=db_user.updated_at
    )

@app.post("/auth/change-password", response_model=APIResponse)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> APIResponse:
    """Change user password"""
    db_user = get_user_by_id(db, current_user.id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify current password
    if not verify_password(password_data.current_password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    db_user.hashed_password = get_password_hash(password_data.new_password)
    db_user.updated_at = datetime.utcnow()
    db.commit()
    
    return APIResponse(
        message="Password changed successfully",
        data={"updated_at": db_user.updated_at}
    )

# Product routes
@app.get("/products", response_model=List[Product])
async def get_products_endpoint(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> List[Product]:
    """Get all products"""
    products = get_products(db, skip=skip, limit=limit)
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

# Order routes
@app.post("/orders", response_model=APIResponse)
async def create_order_endpoint(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> APIResponse:
    """Create a new order"""
    try:
        order = create_order(db, current_user.id, order_data)
        
        return APIResponse(
            message="Order created successfully",
            data={
                "order_id": str(order.id),
                "total": order.total,
                "status": order.status,
                "created_at": order.created_at
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )

@app.get("/orders", response_model=List[Order])
async def get_user_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[Order]:
    """Get user's orders"""
    orders = get_orders_by_user(db, current_user.id)
    return [
        Order(
            id=str(o.id),
            user_id=str(o.user_id),
            items=[],  # You can populate this with order items
            total=o.total,
            status=o.status,
            shipping_address=o.shipping_address,
            payment_method=o.payment_method,
            created_at=o.created_at,
            updated_at=o.updated_at,
            tracking_number=o.tracking_number
        ) for o in orders
    ]

@app.get("/orders/{order_id}", response_model=Order)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Order:
    """Get order by ID"""
    order = get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user owns this order or is admin
    if str(order.user_id) != current_user.id:
        # Check if user is admin
        admin_token = os.getenv("ADMIN_TOKEN", "MyAdminToken123!")
        # This is a simplified check - implement proper admin role checking
        if current_user.email != "admin@sensationbysanu.com":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    return Order(
        id=str(order.id),
        user_id=str(order.user_id),
        items=[],  # You can populate this with order items
        total=order.total,
        status=order.status,
        shipping_address=order.shipping_address,
        payment_method=order.payment_method,
        created_at=order.created_at,
        updated_at=order.updated_at,
        tracking_number=order.tracking_number
    )

# Contact form
@app.post("/contact", response_model=APIResponse)
async def submit_contact_form(
    contact: ContactForm,
    db: Session = Depends(get_db)
) -> APIResponse:
    """Submit contact form"""
    try:
        create_contact(db, contact)
        
        return APIResponse(
            message="Contact form submitted successfully",
            data={"submitted_at": datetime.utcnow()}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit contact form: {str(e)}"
        )

# Admin routes
@app.get("/admin/products", response_model=List[Product])
async def get_admin_products(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
) -> List[Product]:
    """Get all products (admin)"""
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

@app.post("/admin/products", response_model=Product)
async def create_product_admin(
    product_data: ProductCreate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
) -> Product:
    """Create a new product (admin)"""
    try:
        product = create_product(db, product_data)
        
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create product: {str(e)}"
        )

@app.put("/admin/products/{product_id}", response_model=Product)
async def update_product_admin(
    product_id: str,
    product_data: ProductUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
) -> Product:
    """Update product (admin)"""
    try:
        product = update_product(db, product_id, product_data)
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update product: {str(e)}"
        )

@app.delete("/admin/products/{product_id}", response_model=APIResponse)
async def delete_product_admin(
    product_id: str,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
) -> APIResponse:
    """Delete product (admin)"""
    try:
        success = delete_product(db, product_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        return APIResponse(
            message="Product deleted successfully",
            data={"product_id": product_id}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete product: {str(e)}"
        )

@app.get("/admin/orders", response_model=List[Order])
async def get_admin_orders(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
) -> List[Order]:
    """Get all orders (admin)"""
    try:
        orders = get_all_orders(db)
        return [
            Order(
                id=str(o.id),
                user_id=str(o.user_id),
                items=[],  # You can populate this with order items
                total=o.total,
                status=o.status,
                shipping_address=o.shipping_address,
                payment_method=o.payment_method,
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

@app.put("/admin/orders/{order_id}", response_model=Order)
async def update_order_admin(
    order_id: str,
    order_update: OrderUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
) -> Order:
    """Update order (admin)"""
    try:
        order = update_order(db, order_id, order_update)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        return Order(
            id=str(order.id),
            user_id=str(order.user_id),
            items=[],  # You can populate this with order items
            total=order.total,
            status=order.status,
            shipping_address=order.shipping_address,
            payment_method=order.payment_method,
            created_at=order.created_at,
            updated_at=order.updated_at,
            tracking_number=order.tracking_number
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update order: {str(e)}"
        )

@app.get("/admin/stats", response_model=AdminStats)
async def get_admin_stats_endpoint(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
) -> AdminStats:
    """Get admin statistics"""
    try:
        stats = get_admin_stats(db)
        return AdminStats(**stats)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch admin stats: {str(e)}"
        )

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.detail,
            details={"status_code": exc.status_code}
        ).dict()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal server error",
            details={"exception": str(exc)}
        ).dict()
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if os.getenv("ENVIRONMENT") == "development" else False
    )
