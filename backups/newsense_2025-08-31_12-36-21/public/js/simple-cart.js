// Simple Cart System for Sensation by Sanu
class SimpleCart {
  constructor() {
    this.storageKey = 'sensation_cart';
    this.init();
  }

  init() {
    // Initialize cart from localStorage
    this.loadCart();
    this.updateCartDisplay();
  }

  // Load cart from localStorage
  loadCart() {
    try {
      const cartData = localStorage.getItem(this.storageKey);
      this.items = cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error loading cart:', error);
      this.items = [];
    }
  }

  // Save cart to localStorage
  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      this.updateCartDisplay();
      // Dispatch event for other pages to listen to
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  // Add item to cart
  addItem(product) {
    if (!product || !product.name || !product.price) {
      console.error('Invalid product data');
      return false;
    }

    const existingItem = this.items.find(item => item.name === product.name);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({
        id: product.id || `product-${Date.now()}`,
        name: product.name,
        price: parseFloat(product.price),
        image: product.img || product.image,
        quantity: 1
      });
    }

    this.saveCart();
    return true;
  }

  // Remove item from cart
  removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
    this.saveCart();
  }

  // Update item quantity
  updateQuantity(itemId, newQuantity) {
    const item = this.items.find(item => item.id === itemId);
    if (item) {
      if (newQuantity <= 0) {
        this.removeItem(itemId);
      } else {
        item.quantity = newQuantity;
        this.saveCart();
      }
    }
  }

  // Clear cart
  clearCart() {
    this.items = [];
    this.saveCart();
  }

  // Get all items
  getItems() {
    return this.items;
  }

  // Get total price
  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Get item count
  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  // Check if cart is empty
  isEmpty() {
    return this.items.length === 0;
  }

  // Update cart display (for navbar cart count)
  updateCartDisplay() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
      const count = this.getItemCount();
      if (count > 0) {
        cartCountElement.textContent = count;
        cartCountElement.style.display = 'block';
      } else {
        cartCountElement.style.display = 'none';
      }
    }
  }
}

// Initialize simple cart globally
window.simpleCart = new SimpleCart();

// Listen for storage changes (when cart is updated from other pages)
window.addEventListener('storage', function(e) {
  if (e.key === 'sensation_cart') {
    window.simpleCart.loadCart();
    window.simpleCart.updateCartDisplay();
  }
}); 