/**
 * Comprehensive Scrolling Fixes for Sensation by Sanu
 * Handles all scrolling-related issues across different devices and browsers
 */

class ScrollManager {
  constructor() {
    this.isMobile = this.detectMobile();
    this.isIOS = this.detectIOS();
    this.isAndroid = this.detectAndroid();
    this.scrollPosition = 0;
    this.init();
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  detectIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  detectAndroid() {
    return /Android/.test(navigator.userAgent);
  }

  init() {
    this.setupScrollOptimizations();
    this.fixVantaScrolling();
    this.setupTouchScrolling();
    this.fixIOSScrolling();
    this.setupScrollEvents();
  }

  setupScrollOptimizations() {
    // Prevent horizontal scrolling
    document.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
      }
    }, { passive: false });

    // Fix for momentum scrolling on mobile
    if (this.isMobile) {
      document.body.style.webkitOverflowScrolling = 'touch';
      document.body.style.overscrollBehavior = 'contain';
    }
  }

  fixVantaScrolling() {
    // Ensure Vanta.js background doesn't interfere with scrolling
    const vantaContainer = document.querySelector('.vanta-container');
    if (vantaContainer) {
      vantaContainer.style.pointerEvents = 'none';
      vantaContainer.style.zIndex = '-1';
    }
  }

  setupTouchScrolling() {
    if (this.isMobile) {
      // Optimize touch scrolling
      const scrollableElements = document.querySelectorAll('.hero, .main-content, .track-container, .checkout-content');
      scrollableElements.forEach(el => {
        el.style.webkitOverflowScrolling = 'touch';
        el.style.overscrollBehavior = 'contain';
      });

      // Fix for mobile viewport height issues
      this.fixMobileViewportHeight();
    }
  }

  fixMobileViewportHeight() {
    // Fix for iOS Safari 100vh issues
    if (this.isIOS) {
      const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };

      setVH();
      window.addEventListener('resize', setVH);
      window.addEventListener('orientationchange', setVH);

      // Apply to hero sections
      const heroElements = document.querySelectorAll('.hero');
      heroElements.forEach(hero => {
        hero.style.minHeight = 'calc(var(--vh, 1vh) * 100)';
      });
    }
  }

  fixIOSScrolling() {
    if (this.isIOS) {
      // Fix for iOS momentum scrolling
      const scrollableContainers = document.querySelectorAll('.main-content, .track-container, .checkout-content');
      scrollableContainers.forEach(container => {
        container.style.webkitOverflowScrolling = 'touch';
        container.style.overscrollBehavior = 'auto';
      });

      // Fix for iOS rubber band effect
      document.body.style.overscrollBehavior = 'contain';
    }
  }

  setupScrollEvents() {
    // Smooth scrolling for anchor links with improved scroll-up handling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          const offset = this.isMobile ? 60 : 80;
          const targetPosition = target.offsetTop - offset;
          const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
          
          // If scrolling up, use smoother animation
          if (targetPosition < currentPosition) {
            this.smoothScrollTo(targetPosition, 800); // Slower for upward scroll
          } else {
            this.smoothScrollTo(targetPosition, 600); // Faster for downward scroll
          }
        }
      });
    });

    // Back to top functionality removed
  }

  // Improved smooth scrolling method
  smoothScrollTo(targetPosition, duration = 600) {
    const startPosition = window.pageYOffset || document.documentElement.scrollTop;
    const distance = targetPosition - startPosition;
    let startTime = null;

    const animation = currentTime => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = this.easeInOutCubic(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    requestAnimationFrame(animation);
  }

  // Easing function for smooth scrolling
  easeInOutCubic(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t + b;
    t -= 2;
    return c / 2 * (t * t * t + 2) + b;
  }

  setupBackToTop() {
    // Back to top button removed - no longer needed
  }

  // Public method to refresh scrolling fixes
  refresh() {
    this.fixVantaScrolling();
    this.setupTouchScrolling();
    this.fixIOSScrolling();
  }

  // Method to disable scrolling (for modals, etc.)
  disableScroll() {
    this.scrollPosition = window.pageYOffset;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.scrollPosition}px`;
    document.body.style.width = '100%';
  }

  // Method to enable scrolling
  enableScroll() {
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('position');
    document.body.style.removeProperty('top');
    document.body.style.removeProperty('width');
    window.scrollTo(0, this.scrollPosition);
  }
}

// Initialize scroll manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.scrollManager = new ScrollManager();
});

// Refresh scrolling fixes when page is fully loaded
window.addEventListener('load', () => {
  if (window.scrollManager) {
    window.scrollManager.refresh();
  }
});

// Handle orientation changes
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    if (window.scrollManager) {
      window.scrollManager.refresh();
    }
  }, 100);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollManager;
}
