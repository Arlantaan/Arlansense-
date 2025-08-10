// Enhanced Cart Management System
class CartManager {
  constructor() {
    this.cart = this.loadCart();
    this.maxItems = (CONFIG && CONFIG.security && CONFIG.security.maxCartItems) || 20;
    this.maxQuantity = (CONFIG && CONFIG.security && CONFIG.security.maxQuantityPerItem) || 10;
    this.init();
  }

  init() {
    this.fixCartImages(); // Fix any existing cart items with wrong images
    this.updateCartDisplay();
    this.setupEventListeners();
    this.trackCartAnalytics();
  }

  loadCart() {
    try {
      const cart = JSON.parse(localStorage.getItem('sensation_cart') || '[]');
      return Array.isArray(cart) ? cart : [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem('sensation_cart', JSON.stringify(this.cart));
      this.updateCartDisplay();
      this.trackCartAnalytics();
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  addItem(product) {
    console.log('CartManager.addItem called with:', product);
    
    // Validate product data
    if (!this.validateProduct(product)) {
      console.error('Product validation failed:', product);
      throw new Error('Invalid product data');
    }

    // Check cart limits
    if (this.cart.length >= this.maxItems) {
      console.error('Cart limit reached:', this.cart.length, '>=', this.maxItems);
      throw new Error(`Cart limit reached (${this.maxItems} items)`);
    }

    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + (product.quantity || 1);
      if (newQuantity > this.maxQuantity) {
        throw new Error(`Maximum quantity (${this.maxQuantity}) exceeded for ${product.name}`);
      }
      existingItem.quantity = newQuantity;
    } else {
      const cartItem = {
        id: product.id || this.generateId(),
        name: product.name,
        price: parseFloat(product.price),
        quantity: product.quantity || 1,
        image: product.image || product.img,
        category: product.category || 'perfume'
      };
      
      this.cart.push(cartItem);
      
      // Debug log for troubleshooting
      console.log('Added to cart:', cartItem);
      console.log('Cart now contains:', this.cart.length, 'items');
    }

    this.saveCart();
    this.showNotification(`${product.name} added to cart`, 'success');
    return true;
  }

  removeItem(productId) {
    const index = this.cart.findIndex(item => item.id === productId);
    if (index > -1) {
      const removedItem = this.cart.splice(index, 1)[0];
      this.saveCart();
      this.showNotification(`${removedItem.name} removed from cart`, 'info');
      return true;
    }
    return false;
  }

  updateQuantity(productId, quantity) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        return this.removeItem(productId);
      }
      if (quantity > this.maxQuantity) {
        throw new Error(`Maximum quantity (${this.maxQuantity}) exceeded`);
      }
      item.quantity = quantity;
      this.saveCart();
      return true;
    }
    return false;
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.showNotification('Cart cleared', 'info');
  }

  // Fix cart items with incorrect image paths
  fixCartImages() {
    const imageMap = {
      'soleil': 'images/grace.webp',
      'nuit': 'images/blackbottle.webp', 
      'blush': 'images/blush.webp',
      'sensation-oil': 'images/perfume_oil2.webp'
    };

    let fixed = false;
    this.cart.forEach(item => {
      const correctImage = imageMap[item.id];
      if (correctImage && item.image !== correctImage) {
        console.log(`Fixing ${item.name}: ${item.image} → ${correctImage}`);
        item.image = correctImage;
        fixed = true;
      }
    });

    if (fixed) {
      this.saveCart();
      console.log('Cart images fixed');
    }
  }

  getCart() {
    return [...this.cart];
  }

  getTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getItemCount() {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  isEmpty() {
    return this.cart.length === 0;
  }

  validateProduct(product) {
    console.log('Validating product:', product);
    
    if (!product) {
      console.error('Product is null or undefined');
      return false;
    }
    
    if (!product.name) {
      console.error('Product name is missing');
      return false;
    }
    
    // Handle both number and string prices
    const price = parseFloat(product.price);
    if (isNaN(price) || price <= 0) {
      console.error('Invalid product price:', product.price);
      return false;
    }
    
    console.log('Product validation passed');
    return true;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  updateCartDisplay() {
    // Update cart icon badge (try both possible IDs)
    const cartBadge = document.getElementById('cart-badge') || document.getElementById('cart-count');
    if (cartBadge) {
      const count = this.getItemCount();
      cartBadge.textContent = count;
      cartBadge.style.display = count > 0 ? 'block' : 'none';
    }

    // Update cart page if on cart page
    if (window.location.pathname.includes('cart.html')) {
      this.renderCartPage();
    }
  }

  renderCartPage() {
    const cartContainer = document.getElementById('cart-items');
    const cartWrapper = document.getElementById('cart-container');
    const totalElement = document.getElementById('cart-total');
    const emptyMessage = document.getElementById('cart-empty');

    if (!cartContainer) return;

    // Debug cart items
    console.log('Rendering cart page. Cart items:', this.cart);
    this.cart.forEach(item => {
      console.log(`Item: ${item.name}, Image: ${item.image || item.img || 'NOT SET'}`);
    });

    if (this.isEmpty()) {
      cartContainer.innerHTML = '';
      if (emptyMessage) emptyMessage.style.display = 'block';
      if (cartWrapper) cartWrapper.style.display = 'none';
      if (totalElement) totalElement.textContent = 'D0';
      return;
    }

    if (emptyMessage) emptyMessage.style.display = 'none';
    if (cartWrapper) cartWrapper.style.display = 'block';

    cartContainer.innerHTML = this.cart.map(item => `
      <div class="cart-item p-3 mb-3" data-id="${item.id}">
        <div class="row align-items-center">
          <div class="col-md-2">
            <img src="${item.image || item.img}" alt="${this.escapeHtml(item.name)}" 
                 class="img-fluid rounded"
                 style="width: 80px; height: 80px; object-fit: cover;"
                 onerror="console.log('Image failed to load:', '${item.image || item.img}'); this.style.display='none';"
                 onload="console.log('Image loaded successfully:', this.src)">
          </div>
          <div class="col-md-4">
            <h5 class="mb-1 text-white">${this.escapeHtml(item.name)}</h5>
            <p class="mb-0 text-muted">Unit Price: D${parseFloat(item.price).toLocaleString()}</p>
          </div>
          <div class="col-md-3">
            <div class="d-flex align-items-center">
              <button class="btn btn-outline-light btn-sm" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity - 1})">
                <i class="bi bi-dash"></i>
              </button>
              <span class="mx-3 text-white">${item.quantity}</span>
              <button class="btn btn-outline-light btn-sm" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity + 1})">
                <i class="bi bi-plus"></i>
              </button>
            </div>
          </div>
          <div class="col-md-2">
            <p class="mb-0 text-warning fw-bold">D${(parseFloat(item.price) * item.quantity).toLocaleString()}</p>
          </div>
          <div class="col-md-1">
            <button class="btn btn-outline-danger btn-sm" onclick="cartManager.removeItem('${item.id}')">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    if (totalElement) {
      totalElement.textContent = `D${this.getTotal().toLocaleString()}`;
    }
  }

  setupEventListeners() {
    // Listen for storage changes (multi-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key === 'sensation_cart') {
        this.cart = this.loadCart();
        this.updateCartDisplay();
      }
    });

    // Listen for beforeunload to save cart
    window.addEventListener('beforeunload', () => {
      this.saveCart();
    });
  }

  showNotification(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-body">
        ${this.escapeHtml(message)}
      </div>
    `;

    // Add to page
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    toastContainer.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  trackCartAnalytics() {
    if (CONFIG.features.enableAnalytics) {
      fetch('/api/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'cart_updated',
          data: {
            itemCount: this.getItemCount(),
            total: this.getTotal(),
            items: this.cart.map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price
            }))
          }
        })
      }).catch(console.error);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize cart manager
const cartManager = new CartManager();

// Global functions for backward compatibility
window.addToCart = (product) => cartManager.addItem(product);
window.removeFromCart = (productId) => cartManager.removeItem(productId);
window.updateCartQuantity = (productId, quantity) => cartManager.updateQuantity(productId, quantity);
window.clearCart = () => cartManager.clearCart();
window.getCart = () => cartManager.getCart();
window.getCartTotal = () => cartManager.getTotal(); 