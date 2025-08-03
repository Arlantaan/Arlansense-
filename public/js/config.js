// Environment Configuration - Industry Standard
const CONFIG = {
  // Firebase Configuration
  firebase: {
    apiKey: "AIzaSyBIFg1ZFGZ2k34Bc8hhhLKSf9ArnesiNhg",
    authDomain: "newsense-27a7a.firebaseapp.com",
    projectId: "newsense-27a7a",
    storageBucket: "newsense-27a7a.firebasestorage.app",
    messagingSenderId: "348185741664",
    appId: "1:348185741664:web:a2ff7676deec0cecaa3605",
    measurementId: "G-SZ18TF0YHW"
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
    publishableKey: "pk_test_your_stripe_key_here",
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