"""
Database models and schemas for Sensation by Sanu API
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from enum import Enum


class OrderStatus(str, Enum):
    """Order status enumeration"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class PaymentMethod(str, Enum):
    """Payment method enumeration"""
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    BANK_TRANSFER = "bank_transfer"
    CASH_ON_DELIVERY = "cash_on_delivery"


class FragrancePyramid(BaseModel):
    """Fragrance pyramid structure"""
    top_notes: List[str] = Field(default_factory=list)
    middle_notes: List[str] = Field(default_factory=list)
    base_notes: List[str] = Field(default_factory=list)


class Product(BaseModel):
    """Product model"""
    id: str = Field(..., description="Unique product identifier")
    name: str = Field(..., min_length=1, max_length=100)
    price: int = Field(..., gt=0, description="Price in cents")
    image: str = Field(..., description="Product image URL")
    description: str = Field(..., min_length=10, max_length=500)
    tagline: Optional[str] = Field(None, max_length=200)
    fragrance_pyramid: Optional[FragrancePyramid] = None
    in_stock: bool = Field(default=True)
    quantity: Optional[int] = Field(None, ge=0)
    category: Optional[str] = Field(None, max_length=50)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CartItem(BaseModel):
    """Shopping cart item"""
    product_id: str = Field(..., description="Product ID")
    quantity: int = Field(..., gt=0, le=10, description="Quantity (max 10)")


class Address(BaseModel):
    """Shipping address"""
    street: str = Field(..., min_length=5, max_length=200)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    postal_code: str = Field(..., min_length=5, max_length=20)
    country: str = Field(..., min_length=2, max_length=100)


class Order(BaseModel):
    """Order model"""
    id: str = Field(..., description="Unique order identifier")
    user_id: str = Field(..., description="User identifier")
    items: List[CartItem] = Field(..., min_items=1)
    total: int = Field(..., gt=0, description="Total amount in cents")
    status: OrderStatus = Field(default=OrderStatus.PENDING)
    shipping_address: Address
    payment_method: PaymentMethod
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    tracking_number: Optional[str] = Field(None, max_length=50)


class ContactForm(BaseModel):
    """Contact form submission"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=10, max_length=1000)
    subject: Optional[str] = Field(None, max_length=200)


class User(BaseModel):
    """User model"""
    id: str = Field(..., description="Unique user identifier")
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[Address] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)


class UserCreate(BaseModel):
    """User creation model"""
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    password: str = Field(..., min_length=8, max_length=100)


class UserLogin(BaseModel):
    """User login model"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """JWT token model"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: User


class PasswordChange(BaseModel):
    """Password change model"""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    """User update model"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[Address] = None


class OrderCreate(BaseModel):
    """Order creation model"""
    items: List[CartItem] = Field(..., min_items=1)
    shipping_address: Address
    payment_method: PaymentMethod


class OrderUpdate(BaseModel):
    """Order update model"""
    status: Optional[OrderStatus] = None
    tracking_number: Optional[str] = Field(None, max_length=50)


class AdminStats(BaseModel):
    """Admin statistics model"""
    total_orders: int = Field(..., ge=0)
    total_revenue: int = Field(..., ge=0)
    pending_orders: int = Field(..., ge=0)
    total_products: int = Field(..., ge=0)
    active_users: int = Field(..., ge=0)
    monthly_revenue: int = Field(..., ge=0)
    low_stock_products: int = Field(..., ge=0)
    recent_orders: List[Order] = Field(default_factory=list)


class ProductCreate(BaseModel):
    """Product creation model"""
    name: str = Field(..., min_length=1, max_length=100)
    price: int = Field(..., gt=0)
    image: str = Field(..., description="Product image URL")
    description: str = Field(..., min_length=10, max_length=500)
    tagline: Optional[str] = Field(None, max_length=200)
    fragrance_pyramid: Optional[FragrancePyramid] = None
    quantity: int = Field(..., ge=0)
    category: Optional[str] = Field(None, max_length=50)


class ProductUpdate(BaseModel):
    """Product update model"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[int] = Field(None, gt=0)
    image: Optional[str] = None
    description: Optional[str] = Field(None, min_length=10, max_length=500)
    tagline: Optional[str] = Field(None, max_length=200)
    fragrance_pyramid: Optional[FragrancePyramid] = None
    in_stock: Optional[bool] = None
    quantity: Optional[int] = Field(None, ge=0)
    category: Optional[str] = Field(None, max_length=50)


class APIResponse(BaseModel):
    """Standard API response model"""
    success: bool = Field(default=True)
    message: str
    data: Optional[Any] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = Field(default=False)
    error: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
