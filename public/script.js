/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const {onDocumentWritten} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Initialize Firebase Admin
admin.initializeApp();

// Set global options for cost control
setGlobalOptions({ 
  maxInstances: 10,
  timeoutSeconds: 540,
  memory: '256MiB'
});

// Email Configuration
const emailConfig = {
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'abdullaalami1@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'test@123'
  }
};

const mailTransport = nodemailer.createTransport(emailConfig);

// Email Templates
const emailTemplates = {
  orderConfirmation: (order) => ({
    subject: `Order Confirmed - ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(90deg, #8B5C2A 0%, #FFD700 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Sensation by Sanu</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Order Confirmation</h2>
          <p>Dear ${order.name},</p>
          <p>Thank you for your order! We're excited to prepare your fragrances.</p>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total:</strong> D${order.subtotal.toLocaleString()}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3>Items Ordered</h3>
            ${order.cart.map(item => `
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <span>${item.name} x${item.qty}</span>
                <span>D${(item.price * item.qty).toLocaleString()}</span>
              </div>
            `).join('')}
          </div>
          
          <div style="background: #e6c98a; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Delivery Information</h3>
            <p><strong>Address:</strong> ${order.address}</p>
            <p><strong>Phone:</strong> ${order.phone}</p>
          </div>
          
          <p>We'll notify you when your order ships. Track your order at:</p>
          <a href="${process.env.WEBSITE_URL}/track.html?order=${order.orderId}" 
             style="background: #8B5C2A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Track Order
          </a>
          
          <p style="margin-top: 30px;">Thank you for choosing Sensation by Sanu!</p>
        </div>
      </div>
    `
  }),
  
  adminNotification: (order) => ({
    subject: `New Order #${order.orderId} - ${order.name}`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>New Order Received</h2>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Customer:</strong> ${order.name}</p>
        <p><strong>Email:</strong> ${order.email}</p>
        <p><strong>Phone:</strong> ${order.phone}</p>
        <p><strong>Total:</strong> D${order.subtotal.toLocaleString()}</p>
        <p><strong>Items:</strong></p>
        <ul>
          ${order.cart.map(item => `<li>${item.name} x${item.qty} - D${(item.price * item.qty).toLocaleString()}</li>`).join('')}
        </ul>
        <p><strong>Address:</strong> ${order.address}</p>
      </div>
    `
  })
};

// Order Processing Function
exports.processNewOrder = onDocumentWritten('orders/{orderId}', async (event) => {
  const order = event.data.after.data();
  const orderId = event.params.orderId;
  
  if (!order) return null;
  
  try {
    // Add order ID to document
    await event.data.after.ref.update({
      orderId: orderId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Send customer confirmation email
    const customerEmail = emailTemplates.orderConfirmation({
      ...order,
      orderId: orderId
    });
    
    await mailTransport.sendMail({
      from: `Sensation by Sanu <${emailConfig.auth.user}>`,
      to: order.email,
      ...customerEmail
    });
    
    // Send admin notification
    const adminEmail = emailTemplates.adminNotification({
      ...order,
      orderId: orderId
    });
    
    await mailTransport.sendMail({
      from: `Sensation Orders <${emailConfig.auth.user}>`,
      to: emailConfig.auth.user,
      ...adminEmail
    });
    
    // Update inventory
    await updateInventory(order.cart);
    
    logger.info(`Order ${orderId} processed successfully`);
    return null;
  } catch (error) {
    logger.error(`Error processing order ${orderId}:`, error);
    throw error;
  }
});

// Inventory Management
async function updateInventory(cart) {
  const db = admin.firestore();
  
  for (const item of cart) {
    const productRef = db.collection('inventory').doc(item.name);
    const productDoc = await productRef.get();
    
    if (productDoc.exists) {
      const currentStock = productDoc.data().stock || 0;
      await productRef.update({
        stock: Math.max(0, currentStock - item.qty),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }
}

// Payment Processing Functions
exports.createPaymentIntent = onRequest(async (req, res) => {
  try {
    const { amount, currency = 'gmd', metadata = {} } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      metadata: metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    logger.error('Payment intent creation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

exports.verifyPayment = onRequest(async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    res.json({ 
      success: paymentIntent.status === 'succeeded',
      status: paymentIntent.status 
    });
  } catch (error) {
    logger.error('Payment verification failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analytics Function
exports.trackEvent = onRequest(async (req, res) => {
  try {
    const { event, data } = req.body;
    
    await admin.firestore().collection('analytics').add({
      event,
      data,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Analytics tracking failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health Check
exports.healthCheck = onRequest((req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});
