// Payment System - Stripe Integration
class PaymentSystem {
  constructor() {
    this.stripe = Stripe(CONFIG.payment.publishableKey);
    this.elements = null;
    this.paymentElement = null;
    this.clientSecret = null;
  }

  async initializePayment(amount, currency = 'gmd') {
    try {
      // Create payment intent on server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: currency,
          metadata: {
            order_type: 'perfume_purchase'
          }
        })
      });

      const { clientSecret } = await response.json();
      this.clientSecret = clientSecret;

      // Setup Stripe Elements
      this.elements = this.stripe.elements({
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#e6c98a',
            colorBackground: '#ffffff',
            colorText: '#23201c',
          }
        }
      });

      this.paymentElement = this.elements.create('payment');
      this.paymentElement.mount('#payment-element');

      return true;
    } catch (error) {
      console.error('Payment initialization failed:', error);
      throw new Error('Payment setup failed');
    }
  }

  async processPayment() {
    try {
      const { error } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success.html`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  }

  async verifyPayment(paymentIntentId) {
    try {
      const response = await fetch(`/api/verify-payment/${paymentIntentId}`);
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  }
}

// Payment UI Components
class PaymentUI {
  static showLoading() {
    const loader = document.createElement('div');
    loader.id = 'payment-loader';
    loader.innerHTML = `
      <div class="payment-loading">
        <div class="spinner-border text-warning" role="status">
          <span class="visually-hidden">Processing payment...</span>
        </div>
        <p class="mt-2">Processing your payment...</p>
      </div>
    `;
    document.body.appendChild(loader);
  }

  static hideLoading() {
    const loader = document.getElementById('payment-loader');
    if (loader) loader.remove();
  }

  static showError(message) {
    const errorDiv = document.getElementById('payment-error');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
  }

  static hideError() {
    const errorDiv = document.getElementById('payment-error');
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }
  }
}

// Export for use in other modules
window.PaymentSystem = PaymentSystem;
window.PaymentUI = PaymentUI; 