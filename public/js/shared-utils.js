// Shared Utilities for Sensation by Sanu
const SharedUtils = {
  // Format currency
  formatCurrency: function(amount, currency = 'GMD') {
    return `${currency === 'GMD' ? 'D' : '$'}${parseFloat(amount).toLocaleString()}`;
  },

  // Show notification
  showNotification: function(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
    `;
    notification.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, duration);
  },

  // Validate email
  validateEmail: function(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Validate phone
  validatePhone: function(phone) {
    return phone.length >= 10;
  },

  // Get cart count for navbar
  getCartCount: function() {
    try {
      const cart = JSON.parse(localStorage.getItem('sensation_cart')) || [];
      return cart.reduce((count, item) => count + item.quantity, 0);
    } catch (error) {
      return 0;
    }
  },

  // Update navbar cart count
  updateNavbarCartCount: function() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
      const count = this.getCartCount();
      if (count > 0) {
        cartCountElement.textContent = count;
        cartCountElement.style.display = 'block';
      } else {
        cartCountElement.style.display = 'none';
      }
    }
  },

  // Smooth scroll to element
  scrollToElement: function(elementId, offset = 80) {
    const element = document.getElementById(elementId);
    if (element) {
      const targetPosition = element.offsetTop - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  },

  // Close mobile menu
  closeMobileMenu: function() {
    const navbarCollapse = document.querySelector('.navbar-collapse');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navbarCollapse);
      bsCollapse.hide();
    }
  },

  // Track page view
  trackPageView: function(pageName) {
    if (window.analytics) {
      window.analytics.track('page_view', {
        page: pageName,
        title: document.title
      });
    }
  },

  // Generate order ID
  generateOrderId: function() {
    return 'SBS-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  },

  // Update navbar user name
  updateNavbarUserName: function(userName) {
    const userNameElement = document.getElementById('nav-user-name');
    if (userNameElement) {
      if (userName) {
        // Show user's first name only
        const firstName = userName.split(' ')[0];
        userNameElement.textContent = firstName;
      } else {
        userNameElement.textContent = 'Account';
      }
    }
  },

  // Check and update user login status
  checkUserLoginStatus: function() {
    // Check if user is logged in (this will work when Firebase Auth is available)
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.updateNavbarUserName(user.displayName || user.email);
        } else {
          this.updateNavbarUserName(null);
        }
      });
    } else {
      // Fallback: check localStorage for user data
      const userData = localStorage.getItem('sensation_user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.updateNavbarUserName(user.name || user.email);
        } catch (error) {
          this.updateNavbarUserName(null);
        }
      }
    }
  }
};

// Make SharedUtils globally available
window.SharedUtils = SharedUtils;

// Initialize shared functionality
document.addEventListener('DOMContentLoaded', function() {
  // Update cart count on page load
  SharedUtils.updateNavbarCartCount();
  
  // Check user login status and update navbar
  SharedUtils.checkUserLoginStatus();
  
  // Close mobile menu when clicking on nav links
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.addEventListener('click', function() {
      SharedUtils.closeMobileMenu();
    });
  });
  
  // Track page view
  const currentPage = window.location.pathname.split('/').pop() || 'index';
  SharedUtils.trackPageView(currentPage);
}); 