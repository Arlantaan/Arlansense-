# Sensation by Sanu - Animation System

## Overview
This project now includes a comprehensive animation system that enhances the user experience across all pages. The animations are powered by Vanta.js and custom CSS animations.

## Features

### 1. Add to Cart Visual Feedback
- **No more alert messages**: When users click "Add to Cart", they see a beautiful sliding notification instead of browser alerts
- **Cart icon pulse**: The cart icon pulses to provide visual feedback
- **Smooth transitions**: 2-second delay before redirecting to cart page
- **Mobile responsive**: Notifications adapt to mobile screens

### 2. Vanta.js Background Animations
- **Waves animation**: Beautiful flowing wave effects on all pages
- **Interactive**: Animations respond to mouse and touch movements
- **Performance optimized**: Smooth animations that don't impact page performance
- **Consistent across pages**: Same animation style on index, cart, checkout, and success pages

### 3. Enhanced Cart Experience
- **Floating cart items**: Each cart item gently floats with staggered timing
- **Glowing total**: The cart total has a subtle glow effect
- **Glass morphism**: Modern glass-like effects on cart containers
- **Hover animations**: Interactive hover effects on all buttons

### 4. Shared Animation System
- **Centralized animations**: All animations are managed through `js/animations.js`
- **Reusable components**: Animation functions can be used across all pages
- **Easy customization**: Simple configuration options for different animation types

## Files Added/Modified

### New Files
- `js/animations.js` - Main animation system
- `css/animations.css` - Shared animation styles
- `ANIMATIONS_README.md` - This documentation

### Modified Files
- `index.html` - Added animation support and improved add-to-cart
- `cart.html` - Enhanced with Vanta.js background and floating animations
- `checkout.html` - Added Vanta.js background
- `payment-success.html` - Added Vanta.js background

## Usage

### Adding Animations to New Pages

1. **Include the required files**:
```html
<link rel="stylesheet" href="css/animations.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js"></script>
<script src="js/animations.js"></script>
```

2. **Initialize Vanta.js background**:
```javascript
if (window.AnimationUtils) {
  window.AnimationUtils.initializeVantaBackground('.your-container', 'waves');
}
```

3. **Use notification system**:
```javascript
window.AnimationUtils.showNotification('Your message', 'success');
window.AnimationUtils.showAddToCartSuccess('Product Name');
```

### Available Animation Types
- `waves` - Flowing wave effect (default)
- `birds` - Flying bird particles
- `clouds` - Floating cloud effect
- `fog` - Misty fog effect
- `globe` - 3D globe effect
- `net` - Network connection effect
- `particles` - Particle system
- `rings` - Concentric rings
- `topology` - Topological effect

### CSS Animation Classes
- `.floating-element` - Floating animation
- `.pulse` - Pulsing effect
- `.bounce` - Bouncing animation
- `.rotate` - Rotation animation
- `.slide-in-left/right/up` - Slide-in animations
- `.fade-in` - Fade-in effect
- `.scale-in` - Scale-in animation
- `.shimmer` - Shimmer effect
- `.glass-effect` - Glass morphism

## Browser Support
- Modern browsers with CSS3 and WebGL support
- Graceful degradation for older browsers
- Reduced motion support for accessibility

## Performance
- Animations are optimized for 60fps
- Uses hardware acceleration where available
- Automatic cleanup to prevent memory leaks
- Responsive design that works on all devices

## Customization
All animations can be customized by modifying the configuration objects in `js/animations.js` or by overriding CSS variables in `css/animations.css`.

## Accessibility
- Respects `prefers-reduced-motion` media query
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support 