"""
Database operations and data access layer
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import os
from models import Product, Order, User, OrderStatus, PaymentMethod, Address, CartItem


class Database:
    """Simple file-based database for development"""
    
    def __init__(self, data_dir: str = "data") -> None:
        self.data_dir = data_dir
        self._ensure_data_dir()
    
    def _ensure_data_dir(self) -> None:
        """Ensure data directory exists"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
    
    def _get_file_path(self, table_name: str) -> str:
        """Get file path for a table"""
        return os.path.join(self.data_dir, f"{table_name}.json")
    
    def _read_table(self, table_name: str) -> List[Dict[str, Any]]:
        """Read data from a table file"""
        file_path = self._get_file_path(table_name)
        if not os.path.exists(file_path):
            return []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []
    
    def _write_table(self, table_name: str, data: List[Dict[str, Any]]) -> None:
        """Write data to a table file"""
        file_path = self._get_file_path(table_name)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, default=str)
    
    def get_products(self) -> List[Product]:
        """Get all products"""
        products_data = self._read_table("products")
        if not products_data:
            # Initialize with sample data
            sample_products = [
                {
                    "id": "soleil",
                    "name": "Soleil",
                    "price": 5000,
                    "image": "/images/grace.webp",
                    "description": "A fruity-floral embrace with a golden glow of warmth and sophistication",
                    "tagline": "not just a scent, she's a moment.",
                    "fragrance_pyramid": {
                        "top_notes": ["Pear", "Strawberry", "Vanilla"]
                    },
                    "in_stock": True,
                    "quantity": 50,
                    "category": "perfume",
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                },
                {
                    "id": "nuit",
                    "name": "Nuit",
                    "price": 5000,
                    "image": "/images/blackbottle.webp",
                    "description": "Deep, magnetic, and utterly sensual. A timeless evening scent",
                    "tagline": "a presence felt in silence.",
                    "fragrance_pyramid": {
                        "top_notes": ["Bergamot", "Juniperberry", "Clary Sage", "Mandarin"]
                    },
                    "in_stock": True,
                    "quantity": 30,
                    "category": "perfume",
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                },
                {
                    "id": "blush",
                    "name": "Blush",
                    "price": 500,
                    "image": "/images/blush.webp",
                    "description": "A soft floral with a bold undertone — confident, youthful, unforgettable",
                    "in_stock": True,
                    "quantity": 100,
                    "category": "oil",
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                },
                {
                    "id": "sensation-oil",
                    "name": "Sensation Oil",
                    "price": 500,
                    "image": "/images/perfume_oil2.webp",
                    "description": "An oil-based scent crafted for lasting allure — rich, mysterious, and seductive",
                    "tagline": "depth in every drop.",
                    "in_stock": True,
                    "quantity": 75,
                    "category": "oil",
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                }
            ]
            self._write_table("products", sample_products)
            products_data = sample_products
        
        return [Product(**product) for product in products_data]
    
    def get_product(self, product_id: str) -> Optional[Product]:
        """Get a specific product by ID"""
        products = self.get_products()
        for product in products:
            if product.id == product_id:
                return product
        return None
    
    def create_order(self, order: Order) -> Order:
        """Create a new order"""
        orders_data = self._read_table("orders")
        order_dict = order.dict()
        order_dict["created_at"] = order.created_at.isoformat()
        order_dict["updated_at"] = order.updated_at.isoformat()
        orders_data.append(order_dict)
        self._write_table("orders", orders_data)
        return order
    
    def get_order(self, order_id: str) -> Optional[Order]:
        """Get an order by ID"""
        orders_data = self._read_table("orders")
        for order_data in orders_data:
            if order_data["id"] == order_id:
                return Order(**order_data)
        return None
    
    def get_orders(self) -> List[Order]:
        """Get all orders"""
        orders_data = self._read_table("orders")
        return [Order(**order_data) for order_data in orders_data]
    
    def update_order(self, order_id: str, updates: Dict[str, Any]) -> Optional[Order]:
        """Update an order"""
        orders_data = self._read_table("orders")
        for i, order_data in enumerate(orders_data):
            if order_data["id"] == order_id:
                order_data.update(updates)
                order_data["updated_at"] = datetime.utcnow().isoformat()
                orders_data[i] = order_data
                self._write_table("orders", orders_data)
                return Order(**order_data)
        return None
    
    def create_user(self, user: User) -> User:
        """Create a new user"""
        users_data = self._read_table("users")
        user_dict = user.dict()
        user_dict["created_at"] = user.created_at.isoformat()
        user_dict["updated_at"] = user.updated_at.isoformat()
        users_data.append(user_dict)
        self._write_table("users", users_data)
        return user
    
    def get_user(self, user_id: str) -> Optional[User]:
        """Get a user by ID"""
        users_data = self._read_table("users")
        for user_data in users_data:
            if user_data["id"] == user_id:
                return User(**user_data)
        return None
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get a user by email"""
        users_data = self._read_table("users")
        for user_data in users_data:
            if user_data["email"] == email:
                return User(**user_data)
        return None
    
    def get_admin_stats(self) -> Dict[str, int]:
        """Get admin statistics"""
        orders = self.get_orders()
        products = self.get_products()
        users_data = self._read_table("users")
        
        total_orders = len(orders)
        total_revenue = sum(order.total for order in orders if order.status.value == "delivered")
        pending_orders = len([order for order in orders if order.status.value == "pending"])
        total_products = len(products)
        active_users = len(users_data)
        
        # Calculate monthly revenue (last 30 days)
        thirty_days_ago = datetime.utcnow().timestamp() - (30 * 24 * 60 * 60)
        monthly_revenue = sum(
            order.total for order in orders 
            if order.status.value == "delivered" and 
            datetime.fromisoformat(order.created_at.isoformat()).timestamp() > thirty_days_ago
        )
        
        return {
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "pending_orders": pending_orders,
            "total_products": total_products,
            "active_users": active_users,
            "monthly_revenue": monthly_revenue
        }


# Global database instance
db = Database()
