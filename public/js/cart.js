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

    // Update mobile floating cart badge
    this.updateMobileCartBadge();

    // Update cart page if on cart page
    if (window.location.pathname.includes('cart.html')) {
      this.renderCartPage();
      this.updateCartFooter();
    }
  }

  // Show/hide cart footer based on cart content
  updateCartFooter() {
    const cartFooter = document.getElementById('cart-actions-footer');
    if (cartFooter) {
      if (this.isEmpty()) {
        cartFooter.style.display = 'none';
      } else {
        cartFooter.style.display = 'block';
      }
    }
  }

  // Update mobile floating cart badge
  updateMobileCartBadge() {
    const mobileCartIcon = document.querySelector('.floating-cart-mobile .bi-cart3') || 
                          document.querySelector('.floating-cart-mobile-inner .bi-cart3');
    if (mobileCartIcon && this.isMobile()) {
      const count = this.getItemCount();
      
      // Remove existing badge
      const existingBadge = mobileCartIcon.parentNode.querySelector('.mobile-cart-badge');
      if (existingBadge) {
        existingBadge.remove();
      }
      
      // Add new badge if there are items
      if (count > 0) {
        const badge = document.createElement('span');
        badge.className = 'mobile-cart-badge';
        badge.textContent = count;
        badge.style.cssText = `
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(135deg, #e6c98a, #bfa76a);
          color: #23201c;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 2px solid #fff;
          z-index: 10;
        `;
        mobileCartIcon.parentNode.style.position = 'relative';
        mobileCartIcon.parentNode.appendChild(badge);
      }
    }
  }

  // Show mobile cart preview
  showMobileCartPreview() {
    if (!this.isMobile()) return;

    const preview = document.createElement('div');
    preview.className = 'mobile-cart-preview';
    preview.innerHTML = `
      <div class="mobile-cart-overlay" onclick="this.parentNode.remove()"></div>
      <div class="mobile-cart-content">
        <div class="mobile-cart-header">
          <h3>Shopping Cart</h3>
          <button class="mobile-cart-close" onclick="this.closest('.mobile-cart-preview').remove()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="mobile-cart-items">
          ${this.renderMobileCartItems()}
        </div>
        <div class="mobile-cart-footer">
          <div class="mobile-cart-total">
            Total: D${this.getTotal().toLocaleString()}
          </div>
          <div class="mobile-cart-actions">
            <button class="btn btn-outline-light" onclick="this.closest('.mobile-cart-preview').remove()">
              Continue Shopping
            </button>
            <a href="cart.html" class="btn btn-custom">
              View Cart
            </a>
          </div>
        </div>
      </div>
    `;

    // Add CSS styles for mobile preview
    const style = document.createElement('style');
    style.textContent = `
      .mobile-cart-preview {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: flex;
        align-items: flex-end;
      }
      
      .mobile-cart-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(5px);
      }
      
      .mobile-cart-content {
        position: relative;
        background: linear-gradient(135deg, #23201c, #2a2520);
        width: 100%;
        max-height: 70vh;
        border-radius: 20px 20px 0 0;
        color: white;
        transform: translateY(100%);
        animation: slideUp 0.3s ease forwards;
      }
      
      @keyframes slideUp {
        to { transform: translateY(0); }
      }
      
      .mobile-cart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      
      .mobile-cart-header h3 {
        margin: 0;
        font-size: 1.4rem;
        font-weight: 700;
      }
      
      .mobile-cart-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        padding: 8px;
        cursor: pointer;
      }
      
      .mobile-cart-items {
        max-height: 40vh;
        overflow-y: auto;
        padding: 0 20px;
      }
      
      .mobile-cart-item {
        display: flex;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid rgba(255,255,255,0.05);
      }
      
      .mobile-cart-item img {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        margin-right: 12px;
        object-fit: cover;
      }
      
      .mobile-cart-item-info {
        flex: 1;
      }
      
      .mobile-cart-item-name {
        font-weight: 600;
        margin-bottom: 4px;
      }
      
      .mobile-cart-item-price {
        color: #e6c98a;
        font-size: 0.9rem;
      }
      
      .mobile-cart-footer {
        padding: 20px;
        border-top: 1px solid rgba(255,255,255,0.1);
      }
      
      .mobile-cart-total {
        font-size: 1.3rem;
        font-weight: 700;
        color: #e6c98a;
        text-align: center;
        margin-bottom: 15px;
      }
      
      .mobile-cart-actions {
        display: flex;
        gap: 10px;
      }
      
      .mobile-cart-actions .btn {
        flex: 1;
        padding: 12px;
        border-radius: 12px;
        font-weight: 600;
        text-decoration: none;
        text-align: center;
      }
    `;
    
    if (!document.getElementById('mobile-cart-preview-styles')) {
      style.id = 'mobile-cart-preview-styles';
      document.head.appendChild(style);
    }

    document.body.appendChild(preview);
  }

  renderMobileCartItems() {
    if (this.isEmpty()) {
      return '<div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">Your cart is empty</div>';
    }

    return this.cart.map(item => `
      <div class="mobile-cart-item">
        <img src="${item.image || item.img}" alt="${this.escapeHtml(item.name)}">
        <div class="mobile-cart-item-info">
          <div class="mobile-cart-item-name">${this.escapeHtml(item.name)}</div>
          <div class="mobile-cart-item-price">D${(item.price * item.quantity).toLocaleString()} (${item.quantity}x)</div>
        </div>
      </div>
    `).join('');
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
    // Enhanced mobile-first notification system
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Add icon based on type
    const icons = {
      success: '✅',
      error: '❌', 
      info: 'ℹ️'
    };
    
    toast.innerHTML = `
      <div class="toast-body">
        <span style="font-size: 18px; margin-right: 8px;">${icons[type] || icons.info}</span>
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

    // Mobile haptic feedback
    if (navigator.vibrate && this.isMobile()) {
      const vibrationPattern = {
        success: [50, 30, 50],
        error: [100, 50, 100, 50, 100],
        info: [50]
      };
      navigator.vibrate(vibrationPattern[type] || vibrationPattern.info);
    }

    // Show toast with animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto-hide based on message length (longer messages = longer display)
    const displayTime = Math.max(3000, message.length * 50);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, displayTime);

    // Allow manual dismissal on tap
    toast.addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    });
  }

  // Mobile detection helper
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
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