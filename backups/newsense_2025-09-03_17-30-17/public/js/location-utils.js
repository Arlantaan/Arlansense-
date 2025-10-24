// Location-based utility functions for Sensation by Sanu
class LocationManager {
  constructor() {
    this.userLocation = null;
    this.isGambia = false;
    this.detectionComplete = false;
    this.callbacks = [];
  }

  // Detect user location
  async detectLocation() {
    try {
      console.log('🌍 Detecting user location...');
      
      // Try multiple detection methods
      const location = await Promise.race([
        this.detectByGeolocation(),
        this.detectByIP(),
        this.detectByTimezone()
      ]);

      this.userLocation = location;
      this.isGambia = this.checkIfGambia(location);
      this.detectionComplete = true;

      console.log('📍 Location detected:', {
        location: this.userLocation,
        isGambia: this.isGambia
      });

      // Execute callbacks
      this.callbacks.forEach(callback => callback(this.isGambia, this.userLocation));
      
      return { isGambia: this.isGambia, location: this.userLocation };
    } catch (error) {
      console.warn('⚠️ Location detection failed, defaulting to international:', error);
      // Default to international (shipping required) if detection fails
      this.isGambia = false;
      this.detectionComplete = true;
      this.callbacks.forEach(callback => callback(false, null));
      return { isGambia: false, location: null };
    }
  }

  // Geolocation API method
  detectByGeolocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({
            method: 'geolocation',
            latitude,
            longitude,
            country: this.getCountryFromCoords(latitude, longitude)
          });
        },
        (error) => reject(error),
        { timeout: 5000, enableHighAccuracy: false }
      );
    });
  }

  // IP-based detection method
  async detectByIP() {
    try {
      const response = await fetch('https://ipapi.co/json/', { timeout: 3000 });
      const data = await response.json();
      
      return {
        method: 'ip',
        country: data.country_name,
        countryCode: data.country_code,
        city: data.city,
        region: data.region
      };
    } catch (error) {
      throw new Error('IP detection failed');
    }
  }

  // Timezone-based detection method
  detectByTimezone() {
    return new Promise((resolve) => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Gambia timezone indicators
      const gambiaTimezone = timezone === 'Africa/Banjul' || 
                            timezone === 'GMT' || 
                            timezone === 'UTC';
      
      setTimeout(() => {
        resolve({
          method: 'timezone',
          timezone,
          country: gambiaTimezone ? 'Gambia' : 'International'
        });
      }, 1000);
    });
  }

  // Check if location indicates Gambia
  checkIfGambia(location) {
    if (!location) return false;

    // Check by country name/code
    if (location.country) {
      const country = location.country.toLowerCase();
      if (country.includes('gambia') || location.countryCode === 'GM') {
        return true;
      }
    }

    // Check by coordinates (Gambia bounds)
    if (location.latitude && location.longitude) {
      const lat = location.latitude;
      const lng = location.longitude;
      
      // Gambia coordinates bounds (approximate)
      const gambiaBox = {
        north: 13.8,
        south: 13.0,
        east: -13.8,
        west: -16.8
      };
      
      if (lat >= gambiaBox.south && lat <= gambiaBox.north &&
          lng >= gambiaBox.west && lng <= gambiaBox.east) {
        return true;
      }
    }

    // Check by timezone
    if (location.timezone && location.timezone === 'Africa/Banjul') {
      return true;
    }

    return false;
  }

  // Get country from coordinates (simplified)
  getCountryFromCoords(lat, lng) {
    // Gambia coordinates check
    if (lat >= 13.0 && lat <= 13.8 && lng >= -16.8 && lng <= -13.8) {
      return 'Gambia';
    }
    return 'International';
  }

  // Register callback for when location is detected
  onLocationDetected(callback) {
    if (this.detectionComplete) {
      callback(this.isGambia, this.userLocation);
    } else {
      this.callbacks.push(callback);
    }
  }

  // Get current location status
  getLocationStatus() {
    return {
      isGambia: this.isGambia,
      location: this.userLocation,
      detected: this.detectionComplete
    };
  }

  // Force set location (for testing)
  setLocation(isGambia, location = null) {
    this.isGambia = isGambia;
    this.userLocation = location;
    this.detectionComplete = true;
    console.log('🔧 Location manually set:', { isGambia, location });
  }
}

// Order flow manager based on location
class OrderFlowManager {
  constructor(locationManager) {
    this.locationManager = locationManager;
  }

  // Get order steps based on location
  getOrderSteps(isGambia) {
    if (isGambia) {
      return [
        { id: 'processing', label: 'Order Processing', icon: 'bi-gear' },
        { id: 'confirmed', label: 'Order Confirmed', icon: 'bi-check-circle' },
        { id: 'preparing', label: 'Preparing Order', icon: 'bi-box' },
        { id: 'ready', label: 'Ready for Pickup/Delivery', icon: 'bi-truck' },
        { id: 'delivered', label: 'Delivered', icon: 'bi-house-check' }
      ];
    } else {
      return [
        { id: 'processing', label: 'Order Processing', icon: 'bi-gear' },
        { id: 'confirmed', label: 'Order Confirmed', icon: 'bi-check-circle' },
        { id: 'preparing', label: 'Preparing Order', icon: 'bi-box' },
        { id: 'shipped', label: 'Shipped', icon: 'bi-truck' },
        { id: 'in_transit', label: 'In Transit', icon: 'bi-geo-alt' },
        { id: 'delivered', label: 'Delivered', icon: 'bi-house-check' }
      ];
    }
  }

  // Get admin status options based on location
  getAdminStatusOptions(isGambia) {
    const baseOptions = [
      { value: 'processing', label: 'Processing' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'preparing', label: 'Preparing' }
    ];

    if (isGambia) {
      return [
        ...baseOptions,
        { value: 'ready', label: 'Ready for Pickup/Delivery' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
      ];
    } else {
      return [
        ...baseOptions,
        { value: 'shipped', label: 'Shipped' },
        { value: 'in_transit', label: 'In Transit' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
      ];
    }
  }

  // Apply location-based UI changes
  applyLocationBasedUI(isGambia) {
    // Update shipping-related elements
    const shippingElements = document.querySelectorAll('.shipping-section, .shipping-info, [data-shipping]');
    shippingElements.forEach(el => {
      if (isGambia) {
        el.style.display = 'none';
        el.classList.add('local-delivery');
      } else {
        el.style.display = '';
        el.classList.remove('local-delivery');
      }
    });

    // Update labels
    const deliveryLabels = document.querySelectorAll('.delivery-label');
    deliveryLabels.forEach(el => {
      el.textContent = isGambia ? 'Local Delivery' : 'Shipping';
    });

    // Add location indicator
    this.addLocationIndicator(isGambia);
  }

  // Add location indicator to UI
  addLocationIndicator(isGambia) {
    const existingIndicator = document.getElementById('location-indicator');
    if (existingIndicator) existingIndicator.remove();

    const indicator = document.createElement('div');
    indicator.id = 'location-indicator';
    indicator.className = `alert ${isGambia ? 'alert-success' : 'alert-info'} alert-dismissible fade show`;
    indicator.innerHTML = `
      <i class="bi ${isGambia ? 'bi-geo-alt-fill' : 'bi-globe'}"></i>
      <strong>${isGambia ? '🇬🇲 Local Delivery' : '🌍 International Shipping'}</strong>
      ${isGambia ? 'No shipping fees for Gambia orders' : 'International shipping will be calculated'}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Insert at top of main content
    const mainContent = document.querySelector('main, .container, .checkout-content');
    if (mainContent) {
      mainContent.insertBefore(indicator, mainContent.firstChild);
    }
  }
}

// Global instances
const locationManager = new LocationManager();
const orderFlowManager = new OrderFlowManager(locationManager);

// Global functions
window.locationManager = locationManager;
window.orderFlowManager = orderFlowManager;

// Auto-detect location when script loads
document.addEventListener('DOMContentLoaded', () => {
  locationManager.detectLocation();
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LocationManager, OrderFlowManager };
}
