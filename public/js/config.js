// Environment Configuration - Industry Standard
const CONFIG = {
  // Firebase Configuration
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAXfFinXJJf8QjV37tuuOa_8cYzg0Cn3Q4",
    authDomain: "sensation-by-sanu.firebaseapp.com",
    projectId: "sensation-by-sanu",
    storageBucket: "sensation-by-sanu.appspot.com",
    messagingSenderId: "985250517980",
    appId: "1:985250517980:web:05011bfb5877ff7c193519",
    measurementId: "G-VHH6P2L106"
  },
  
  // Business Configuration
  business: {
    name: "Sensation by Sanu",
    currency: "GMD",
    currencySymbol: "D",
    supportEmail: "support@sensationbysanu.com",
    adminEmail: "admin@sensationbysanu.com"
  },
  
  // Payment Configuration (Stripe)
  payment: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "pk_test_your_stripe_key_here",
    currency: "gmd"
  },
  
  // Security
  security: {
    allowedAdmins: [
      "abdullaalami1@gmail.com",
      "admin@sensationbysanu.com"
    ],
    maxCartItems: 10,
    maxQuantityPerItem: 5
  },
  
  // Features
  features: {
    enableAnalytics: true,
    enableNotifications: true,
    enableInventoryTracking: true,
    enableOrderTracking: true
  }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} 