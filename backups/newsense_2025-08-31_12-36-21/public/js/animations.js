// Shared Animation Functions for Sensation by Sanu
// This file contains animations and visual effects used across all pages

// Vanta.js Background Initialization
function initializeVantaBackground(elementSelector = '.hero', type = 'waves') {
  if (typeof VANTA === 'undefined') {
    console.warn('Vanta.js not loaded');
    return;
  }

  const config = {
    el: elementSelector,
    mouseControls: true,
    touchControls: true,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.0,
    scaleMobile: 1.0,
    color: 0x8B5C2A,
    shininess: 50.0,
    waveHeight: 20.0,
    waveSpeed: 0.7,
    zoom: 0.85
  };

  switch (type) {
    case 'waves':
      return VANTA.WAVES(config);
    case 'birds':
      return VANTA.BIRDS(config);
    case 'clouds':
      return VANTA.CLOUDS(config);
    case 'fog':
      return VANTA.FOG(config);
    case 'globe':
      return VANTA.GLOBE(config);
    case 'net':
      return VANTA.NET(config);
    case 'particles':
      return VANTA.PARTICLES(config);
    case 'rings':
      return VANTA.RINGS(config);
    case 'topology':
      return VANTA.TOPOLOGY(config);
    default:
      return VANTA.WAVES(config);
  }
}

// Add to Cart Success Animation
function showAddToCartSuccess(productName) {
  // Create success notification
  const notification = document.createElement('div');
  notification.className = 'add-to-cart-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <i class="bi bi-check-circle-fill text-success me-2"></i>
      <span>${productName} added to cart!</span>
      <i class="bi bi-arrow-right ms-2"></i>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Remove after animation
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 2000);
}

// Generic Notification System
function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, duration);
}

// Cart Icon Pulse Animation
function pulseCartIcon() {
  const cartIcons = document.querySelectorAll('.bi-cart3, .cart-navbar-icon i');
  cartIcons.forEach(icon => {
    icon.classList.add('cart-icon-pulse');
    setTimeout(() => {
      icon.classList.remove('cart-icon-pulse');
    }, 600);
  });
}

// Floating Animation for Elements
function addFloatingAnimation(selector, delay = 0) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((element, index) => {
    element.style.animationDelay = `${delay + (index * 0.5)}s`;
    element.classList.add('floating-element');
  });
}

// Glow Effect for Elements
function addGlowEffect(selector, color = '#e6c98a') {
  const elements = document.querySelectorAll(selector);
  elements.forEach(element => {
    element.style.animation = `glow 2s ease-in-out infinite`;
    element.style.setProperty('--glow-color', color);
  });
}

// Page Transition Effects
function addPageTransitionEffects() {
  // Add fade-in effect to main content
  const mainContent = document.querySelector('main, .container, .hero');
  if (mainContent) {
    mainContent.style.opacity = '0';
    mainContent.style.transform = 'translateY(20px)';
    mainContent.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    setTimeout(() => {
      mainContent.style.opacity = '1';
      mainContent.style.transform = 'translateY(0)';
    }, 100);
  }
}

// Loading Animation
function showLoadingAnimation(container) {
  const loading = document.createElement('div');
  loading.className = 'loading-animation';
  loading.innerHTML = `
    <div class="loading-dots">
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
    </div>
  `;
  
  container.appendChild(loading);
  return loading;
}

function hideLoadingAnimation(loadingElement) {
  if (loadingElement && loadingElement.parentNode) {
    loadingElement.parentNode.removeChild(loadingElement);
  }
}

// Parallax Effect for Background Elements
function addParallaxEffect(selector, speed = 0.5) {
  const elements = document.querySelectorAll(selector);
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    elements.forEach(element => {
      const rate = scrolled * speed;
      element.style.transform = `translateY(${rate}px)`;
    });
  });
}

// Hover Effects for Interactive Elements
function addHoverEffects() {
  // Add hover effects to buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '';
    });
  });
}

// Initialize all animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add page transition effects
  addPageTransitionEffects();
  
  // Add hover effects
  addHoverEffects();
  
  // Add floating animation to cart items
  addFloatingAnimation('.cart-item');
  
  // Add glow effect to cart total
  addGlowEffect('#cart-total');
  
  // Add parallax effect to background elements
  addParallaxEffect('.sbs-bg img', 0.3);
});

// Export functions for use in other scripts
window.AnimationUtils = {
  initializeVantaBackground,
  showAddToCartSuccess,
  showNotification,
  pulseCartIcon,
  addFloatingAnimation,
  addGlowEffect,
  addPageTransitionEffects,
  showLoadingAnimation,
  hideLoadingAnimation,
  addParallaxEffect,
  addHoverEffects
}; 