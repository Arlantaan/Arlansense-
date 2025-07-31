// Analytics System - Industry Standard Tracking
class Analytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.startTime = Date.now();
    this.pageViews = 0;
    this.events = [];
    this.init();
  }

  init() {
    this.trackPageView();
    this.setupEventListeners();
    this.setupPerformanceTracking();
    this.setupErrorTracking();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getUserId() {
    let userId = localStorage.getItem('sensation_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sensation_user_id', userId);
    }
    return userId;
  }

  track(event, data = {}) {
    const eventData = {
      event,
      data,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    this.events.push(eventData);

    // Send to Firebase Analytics
    this.sendToFirebase(eventData);

    // Send to Google Analytics if available
    if (window.gtag) {
      window.gtag('event', event, {
        event_category: 'sensation',
        event_label: data.product_name || data.page || event,
        value: data.value || 1
      });
    }

    console.log('Analytics Event:', event, eventData);
  }

  trackPageView() {
    this.pageViews++;
    this.track('page_view', {
      page: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
      pageViews: this.pageViews
    });
  }

  trackAddToCart(product) {
    this.track('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      currency: 'GMD',
      category: 'perfume'
    });
  }

  trackPurchase(order) {
    this.track('purchase', {
      order_id: order.orderId,
      value: order.subtotal,
      currency: 'GMD',
      items: order.cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }

  trackSearch(query) {
    this.track('search', {
      query,
      results_count: 0 // Will be updated when results are loaded
    });
  }

  trackError(error, context = {}) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href
    });
  }

  trackPerformance(metrics) {
    this.track('performance', {
      loadTime: metrics.loadTime,
      domContentLoaded: metrics.domContentLoaded,
      firstContentfulPaint: metrics.firstContentfulPaint,
      largestContentfulPaint: metrics.largestContentfulPaint
    });
  }

  setupEventListeners() {
    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target;
      this.track('form_submit', {
        form_id: form.id || form.className,
        form_action: form.action
      });
    });

    // Track button clicks
    document.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (button) {
        this.track('button_click', {
          button_text: button.textContent.trim(),
          button_id: button.id,
          button_class: button.className
        });
      }
    });

    // Track external links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.hostname !== window.location.hostname) {
        this.track('external_link', {
          url: link.href,
          text: link.textContent.trim()
        });
      }
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', this.throttle(() => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll % 25 === 0) { // Track every 25%
          this.track('scroll_depth', {
            depth: maxScroll
          });
        }
      }
    }, 1000));

    // Track time on page
    setInterval(() => {
      const timeOnPage = Math.round((Date.now() - this.startTime) / 1000);
      if (timeOnPage % 30 === 0) { // Track every 30 seconds
        this.track('time_on_page', {
          seconds: timeOnPage
        });
      }
    }, 1000);
  }

  setupPerformanceTracking() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          if (perfData) {
            this.trackPerformance({
              loadTime: perfData.loadEventEnd - perfData.loadEventStart,
              domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
              firstContentfulPaint: this.getFirstContentfulPaint(),
              largestContentfulPaint: this.getLargestContentfulPaint()
            });
          }
        }, 1000);
      });
    }
  }

  setupErrorTracking() {
    window.addEventListener('error', (e) => {
      this.trackError(e.error, {
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
      });
    });

    window.addEventListener('unhandledrejection', (e) => {
      this.trackError(new Error(e.reason), {
        type: 'unhandled_promise_rejection'
      });
    });
  }

  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }

  getLargestContentfulPaint() {
    if ('PerformanceObserver' in window) {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      });
    }
    return null;
  }

  async sendToFirebase(eventData) {
    try {
      const response = await fetch('/api/track-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send analytics to Firebase:', error);
    }
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Get analytics summary
  getSummary() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      pageViews: this.pageViews,
      events: this.events.length,
      timeOnSite: Math.round((Date.now() - this.startTime) / 1000)
    };
  }
}

// Initialize analytics
window.analytics = new Analytics();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Analytics;
} 