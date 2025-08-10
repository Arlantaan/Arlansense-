/**
 * Main JavaScript for Sensation by Sanu Website
 * Client-side functionality for product display, interactions, and UI
 */

// Global variables
let currentProducts = [];
let currentCategory = 'all';
let isCartOpen = false;

// Product data - this would typically come from a database
const products = [
  {
    id: 1,
    name: "Grace",
    price: 250,
    image: "images/grace.webp",
    category: "perfume",
    description: "Elegant floral fragrance with notes of jasmine and rose"
  },
  {
    id: 2,
    name: "Black Bottle",
    price: 300,
    image: "images/blackbottle.webp",
    category: "perfume",
    description: "Mysterious oriental scent with amber and vanilla"
  },
  {
    id: 3,
    name: "Blush",
    price: 200,
    image: "images/blush.webp",
    category: "perfume",
    description: "Soft, romantic fragrance perfect for everyday wear"
  },
  {
    id: 4,
    name: "Perfume Oil",
    price: 180,
    image: "images/perfume_oil2.webp",
    category: "oil",
    description: "Concentrated essential oil blend for long-lasting scent"
  }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  console.log('Sensation by Sanu website loaded');
  initializeWebsite();
});

function initializeWebsite() {
  // Set up event listeners
  setupEventListeners();
  
  // Load initial products
  displayProducts();
  
  // Initialize cart
  if (window.cartManager) {
    window.cartManager.init();
  }
  
  // Set up smooth scrolling
  setupSmoothScrolling();
  
  // Initialize animations
  initializeAnimations();
}

function setupEventListeners() {
  // Category filter buttons
  const categoryButtons = document.querySelectorAll('.category-filter');
  categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
      const category = this.dataset.category;
      filterProducts(category);
      
      // Update active button state
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Search functionality
  const searchInput = document.querySelector('#search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      searchProducts(this.value);
    });
  }
  
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  }
  
  // Back to top button
  const backToTopBtn = document.querySelector('.back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', scrollToTop);
  }
}

function displayProducts(category = 'all') {
  const productsContainer = document.querySelector('#products-container');
  if (!productsContainer) return;
  
  let filteredProducts = products;
  if (category !== 'all') {
    filteredProducts = products.filter(product => product.category === category);
  }
  
  currentProducts = filteredProducts;
  
  const productsHTML = filteredProducts.map(product => `
    <div class="col-lg-3 col-md-6 mb-4">
      <div class="card h-100 product-card" data-product-id="${product.id}">
        <img src="${product.image}" class="card-img-top" alt="${product.name}" loading="lazy">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text text-muted">${product.description}</p>
          <div class="mt-auto">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="h5 text-primary mb-0">D${product.price}</span>
              <span class="badge bg-secondary">${product.category}</span>
              </div>
            <button class="btn btn-primary w-100 add-to-cart-btn" 
                    onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
              <i class="bi bi-cart-plus me-2"></i>Add to Cart
            </button>
          </div>
        </div>
      </div>
      </div>
  `).join('');
  
  productsContainer.innerHTML = productsHTML;
  
  // Add animation to new cards
  animateProductCards();
}

function filterProducts(category) {
  currentCategory = category;
  displayProducts(category);
  
  // Smooth scroll to products section
  const productsSection = document.querySelector('#products');
  if (productsSection) {
    productsSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function searchProducts(query) {
  if (!query.trim()) {
    displayProducts(currentCategory);
    return;
  }
  
  const searchResults = products.filter(product => 
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.description.toLowerCase().includes(query.toLowerCase()) ||
    product.category.toLowerCase().includes(query.toLowerCase())
  );
  
  const productsContainer = document.querySelector('#products-container');
  if (!productsContainer) return;
  
  if (searchResults.length === 0) {
    productsContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-search display-1 text-muted"></i>
        <h3 class="mt-3">No products found</h3>
        <p class="text-muted">Try adjusting your search terms</p>
      </div>
    `;
  } else {
    const productsHTML = searchResults.map(product => `
      <div class="col-lg-3 col-md-6 mb-4">
        <div class="card h-100 product-card" data-product-id="${product.id}">
          <img src="${product.image}" class="card-img-top" alt="${product.name}" loading="lazy">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text text-muted">${product.description}</p>
            <div class="mt-auto">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="h5 text-primary mb-0">D${product.price}</span>
                <span class="badge bg-secondary">${product.category}</span>
              </div>
              <button class="btn btn-primary w-100 add-to-cart-btn" 
                      onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                <i class="bi bi-cart-plus me-2"></i>Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    
    productsContainer.innerHTML = productsHTML;
    animateProductCards();
  }
}

function addToCart(product) {
  if (window.cartManager) {
    try {
      window.cartManager.addItem(product);
      showNotification(`${product.name} added to cart!`, 'success');
      return true; // Return true on success
  } catch (error) {
      showNotification(error.message, 'error');
      return false; // Return false on error
    }
  } else {
    // Fallback if cart manager isn't loaded
    showNotification('Cart system not available', 'error');
    return false; // Return false if cart manager not available
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type === 'error' ? 'danger' : type} notification`;
  notification.innerHTML = `
    <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
    ${message}
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

function setupSmoothScrolling() {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

function initializeAnimations() {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);
  
  // Observe elements for animation
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

function animateProductCards() {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add('animate-in');
  });
}

function toggleMobileMenu() {
  const mobileMenu = document.querySelector('.mobile-menu');
  if (mobileMenu) {
    mobileMenu.classList.toggle('show');
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Global functions for external use
window.addToCart = addToCart;
window.filterProducts = filterProducts;
window.searchProducts = searchProducts;

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    products,
    displayProducts,
    filterProducts,
    searchProducts,
    addToCart
  };
}
