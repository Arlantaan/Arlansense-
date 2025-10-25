"""
Production database module with PostgreSQL support
"""

import os
import json
import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy import create_engine, Column, String, Integer, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID
from passlib.context import CryptContext
from jose import JWTError, jwt
from models import *

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://sensation:MyStrongPassword123!@localhost:5432/sensation_db")

# Create engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "MySecretKey123!")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


class UserDB(Base):
    """User database model"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    orders = relationship("OrderDB", back_populates="user")
    addresses = relationship("AddressDB", back_populates="user")


class AddressDB(Base):
    """Address database model"""
    __tablename__ = "addresses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    street = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    postal_code = Column(String, nullable=False)
    country = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("UserDB", back_populates="addresses")


class ProductDB(Base):
    """Product database model"""
    __tablename__ = "products"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    price = Column(Integer, nullable=False)  # Price in cents
    image = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    tagline = Column(String)
    fragrance_pyramid = Column(JSON)  # Store as JSON
    in_stock = Column(Boolean, default=True)
    quantity = Column(Integer, default=0)
    category = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order_items = relationship("OrderItemDB", back_populates="product")


class OrderDB(Base):
    """Order database model"""
    __tablename__ = "orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    total = Column(Integer, nullable=False)  # Total in cents
    status = Column(String, default="pending")
    payment_method = Column(String, nullable=False)
    tracking_number = Column(String)
    shipping_address = Column(JSON)  # Store as JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("UserDB", back_populates="orders")
    items = relationship("OrderItemDB", back_populates="order")


class OrderItemDB(Base):
    """Order item database model"""
    __tablename__ = "order_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"))
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    price_at_time = Column(Integer, nullable=False)  # Price when ordered
    
    # Relationships
    order = relationship("OrderDB", back_populates="items")
    product = relationship("ProductDB", back_populates="order_items")


class ContactDB(Base):
    """Contact form database model"""
    __tablename__ = "contacts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    subject = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


# Create all tables
def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)


# Database dependency
def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Password utilities
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


# JWT utilities
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# User management functions
def create_user(db, user_data: UserCreate) -> UserDB:
    """Create a new user"""
    hashed_password = get_password_hash(user_data.password)
    db_user = UserDB(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db, email: str, password: str) -> Optional[UserDB]:
    """Authenticate user with email and password"""
    user = db.query(UserDB).filter(UserDB.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def get_user_by_email(db, email: str) -> Optional[UserDB]:
    """Get user by email"""
    return db.query(UserDB).filter(UserDB.email == email).first()


def get_user_by_id(db, user_id: str) -> Optional[UserDB]:
    """Get user by ID"""
    return db.query(UserDB).filter(UserDB.id == user_id).first()


# Product management functions
def create_product(db, product_data: ProductCreate) -> ProductDB:
    """Create a new product"""
    db_product = ProductDB(
        name=product_data.name,
        price=product_data.price,
        image=product_data.image,
        description=product_data.description,
        tagline=product_data.tagline,
        fragrance_pyramid=product_data.fragrance_pyramid.dict() if product_data.fragrance_pyramid else None,
        quantity=product_data.quantity,
        category=product_data.category,
        in_stock=product_data.quantity > 0
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def get_products(db, skip: int = 0, limit: int = 100) -> List[ProductDB]:
    """Get all products"""
    return db.query(ProductDB).offset(skip).limit(limit).all()


def get_product_by_id(db, product_id: str) -> Optional[ProductDB]:
    """Get product by ID"""
    return db.query(ProductDB).filter(ProductDB.id == product_id).first()


def update_product(db, product_id: str, product_data: ProductUpdate) -> Optional[ProductDB]:
    """Update product"""
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        return None
    
    update_data = product_data.dict(exclude_unset=True)
    if "fragrance_pyramid" in update_data and update_data["fragrance_pyramid"]:
        update_data["fragrance_pyramid"] = update_data["fragrance_pyramid"].dict()
    
    for field, value in update_data.items():
        setattr(product, field, value)
    
    product.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(product)
    return product


def delete_product(db, product_id: str) -> bool:
    """Delete product"""
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        return False
    
    db.delete(product)
    db.commit()
    return True


# Order management functions
def create_order(db, user_id: str, order_data: OrderCreate) -> OrderDB:
    """Create a new order"""
    # Calculate total
    total = 0
    for item in order_data.items:
        product = get_product_by_id(db, item.product_id)
        if product:
            total += product.price * item.quantity
    
    # Create order
    db_order = OrderDB(
        user_id=user_id,
        total=total,
        status="pending",
        payment_method=order_data.payment_method,
        shipping_address=order_data.shipping_address.dict()
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Create order items
    for item in order_data.items:
        product = get_product_by_id(db, item.product_id)
        if product:
            order_item = OrderItemDB(
                order_id=db_order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price_at_time=product.price
            )
            db.add(order_item)
            
            # Update product quantity
            product.quantity -= item.quantity
            if product.quantity <= 0:
                product.in_stock = False
    
    db.commit()
    return db_order


def get_orders_by_user(db, user_id: str) -> List[OrderDB]:
    """Get orders by user"""
    return db.query(OrderDB).filter(OrderDB.user_id == user_id).order_by(OrderDB.created_at.desc()).all()


def get_all_orders(db, skip: int = 0, limit: int = 100) -> List[OrderDB]:
    """Get all orders (admin)"""
    return db.query(OrderDB).offset(skip).limit(limit).order_by(OrderDB.created_at.desc()).all()


def get_order_by_id(db, order_id: str) -> Optional[OrderDB]:
    """Get order by ID"""
    return db.query(OrderDB).filter(OrderDB.id == order_id).first()


def update_order(db, order_id: str, order_data: OrderUpdate) -> Optional[OrderDB]:
    """Update order"""
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        return None
    
    update_data = order_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(order, field, value)
    
    order.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    return order


# Admin statistics
def get_admin_stats(db) -> Dict[str, Any]:
    """Get admin statistics"""
    total_orders = db.query(OrderDB).count()
    total_revenue = db.query(OrderDB).with_entities(db.func.sum(OrderDB.total)).scalar() or 0
    pending_orders = db.query(OrderDB).filter(OrderDB.status == "pending").count()
    total_products = db.query(ProductDB).count()
    active_users = db.query(UserDB).filter(UserDB.is_active == True).count()
    
    # Monthly revenue
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_revenue = db.query(OrderDB).filter(OrderDB.created_at >= month_start).with_entities(db.func.sum(OrderDB.total)).scalar() or 0
    
    # Low stock products
    low_stock_products = db.query(ProductDB).filter(ProductDB.quantity <= 5).count()
    
    # Recent orders
    recent_orders = db.query(OrderDB).order_by(OrderDB.created_at.desc()).limit(5).all()
    
    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "pending_orders": pending_orders,
        "total_products": total_products,
        "active_users": active_users,
        "monthly_revenue": monthly_revenue,
        "low_stock_products": low_stock_products,
        "recent_orders": recent_orders
    }


# Contact form
def create_contact(db, contact_data: ContactForm) -> ContactDB:
    """Create contact form submission"""
    db_contact = ContactDB(
        name=contact_data.name,
        email=contact_data.email,
        message=contact_data.message,
        subject=contact_data.subject
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact


# Initialize database with sample data
def init_sample_data():
    """Initialize database with sample products"""
    db = SessionLocal()
    try:
        # Check if products already exist
        if db.query(ProductDB).count() > 0:
            return
        
        # Sample products
        sample_products = [
            {
                "name": "Sensation Noir",
                "price": 12999,  # $129.99
                "image": "/assets/blackbottle-544be0fa.webp",
                "description": "A mysterious and seductive fragrance that captures the essence of midnight elegance. Perfect for evening wear and special occasions.",
                "tagline": "Embrace the darkness within",
                "fragrance_pyramid": {
                    "top_notes": ["Black Pepper", "Bergamot", "Cardamom"],
                    "middle_notes": ["Rose", "Jasmine", "Cedar"],
                    "base_notes": ["Sandalwood", "Musk", "Amber"]
                },
                "quantity": 25,
                "category": "Premium"
            },
            {
                "name": "Sensation Blush",
                "price": 8999,  # $89.99
                "image": "/assets/blush-2602fe41.webp",
                "description": "A delicate and romantic fragrance that embodies femininity and grace. Light and airy, perfect for daily wear.",
                "tagline": "Where elegance meets innocence",
                "fragrance_pyramid": {
                    "top_notes": ["Peach", "Pear", "Green Apple"],
                    "middle_notes": ["Rose", "Lily", "Magnolia"],
                    "base_notes": ["Vanilla", "Sandalwood", "White Musk"]
                },
                "quantity": 30,
                "category": "Floral"
            },
            {
                "name": "Sensation Grace",
                "price": 10999,  # $109.99
                "image": "/assets/grace-5dcc9bfe.webp",
                "description": "A sophisticated and timeless fragrance that exudes confidence and refinement. Ideal for the modern professional woman.",
                "tagline": "Grace under pressure",
                "fragrance_pyramid": {
                    "top_notes": ["Citrus", "Green Leaves", "Bergamot"],
                    "middle_notes": ["White Flowers", "Gardenia", "Tuberose"],
                    "base_notes": ["Oakmoss", "Vetiver", "Ambergris"]
                },
                "quantity": 20,
                "category": "Classic"
            },
            {
                "name": "Sensation Oil",
                "price": 4999,  # $49.99
                "image": "/assets/perfume_oil2-8c39f5bb.webp",
                "description": "A concentrated perfume oil that provides long-lasting fragrance with just a few drops. Perfect for layering or solo wear.",
                "tagline": "Pure essence, pure luxury",
                "fragrance_pyramid": {
                    "top_notes": ["Essential Oils", "Citrus Zest"],
                    "middle_notes": ["Floral Essence", "Herbal Notes"],
                    "base_notes": ["Woody Resins", "Amber"]
                },
                "quantity": 50,
                "category": "Oil"
            }
        ]
        
        for product_data in sample_products:
            db_product = ProductDB(**product_data)
            db.add(db_product)
        
        db.commit()
        print("Sample data initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing sample data: {e}")
        db.rollback()
    finally:
        db.close()
