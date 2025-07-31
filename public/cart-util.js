// --- Cart logic for shop pages (index.html, etc) ---
// Load cart from localStorage
function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch {
    return [];
  }
}

// Save cart to localStorage
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Add a product to the cart (global function)
function addToCart(product) {
  let cart = loadCart();
  // Check if product already in cart (by name)
  const idx = cart.findIndex(item => item.name === product.name);
  if (idx !== -1) {
    cart[idx].qty += product.qty || 1;
  } else {
    cart.push({
      name: product.name,
      price: product.price,
      qty: product.qty || 1,
      img: product.img || ''
    });
  }
  saveCart(cart);
  // Optional: show a toast or alert
  alert(`${product.name} added to cart!`);
}

// Make addToCart available globally
window.addToCart = addToCart;
