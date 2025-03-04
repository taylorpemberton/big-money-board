require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const app = express();
const port = process.env.PORT || 4000;

// Middleware for CORS
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'stripe-signature']
}));

// JSON body parser with raw body access for webhook verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
    console.log(`Raw body captured: ${req.rawBody.substring(0, 100)}...`);
  }
}));

// Store events in memory
let recentEvents = [];
// Track the timestamp of the most recent event
let lastEventTimestamp = '';

// Manual webhook signature verification function
function verifyStripeSignature(payload, signature, secret) {
  console.log('Verifying signature...');
  console.log('Signature header:', signature);
  
  if (!signature) {
    console.log('No signature header provided');
    return false;
  }
  
  // Parse the signature header
  const signatureParts = signature.split(',');
  const timestampPart = signatureParts.find(part => part.startsWith('t='));
  const signaturePart = signatureParts.find(part => part.startsWith('v1='));
  
  if (!timestampPart || !signaturePart) {
    console.log('Invalid signature format, missing timestamp or signature part');
    return false;
  }
  
  const timestamp = timestampPart.substring(2);
  const expectedSignature = signaturePart.substring(3);
  
  console.log('Timestamp:', timestamp);
  console.log('Expected signature length:', expectedSignature.length);
  
  // Create the signed payload string that Stripe expects
  const signedPayload = `${timestamp}.${payload}`;
  
  // Generate the signature using the signed payload
  const hmac = crypto.createHmac('sha256', secret);
  const calculatedSignature = hmac.update(signedPayload).digest('hex');
  
  console.log('Generated signature length:', calculatedSignature.length);
  console.log('Expected signature (first 10 chars):', expectedSignature.substring(0, 10));
  console.log('Calculated signature (first 10 chars):', calculatedSignature.substring(0, 10));
  
  try {
    // Check if the signature matches
    const isValid = crypto.timingSafeEqual(
      Buffer.from(calculatedSignature),
      Buffer.from(expectedSignature)
    );
    console.log('Signature verification result:', isValid);
    return isValid;
  } catch (error) {
    console.error('Error during signature verification:', error.message);
    return false;
  }
}

// Platform webhook endpoint
app.post('/platform-webhook', (req, res) => {
  console.log('Received platform webhook request');
  console.log('Headers:', JSON.stringify(req.headers));
  
  const signature = req.headers['stripe-signature'];
  const secret = process.env.PLATFORM_WEBHOOK_SECRET;
  
  if (!signature || !secret) {
    console.error('Missing signature or secret');
    console.error('Signature:', signature);
    console.error('Secret exists:', !!secret);
    return res.status(400).send('Missing signature or secret');
  }
  
  try {
    // Verify the signature
    console.log('Raw body length:', req.rawBody ? req.rawBody.length : 'undefined');
    const isValid = verifyStripeSignature(req.rawBody, signature, secret);
    
    if (!isValid) {
      console.error('Invalid signature');
      return res.status(400).send('Invalid signature');
    }
    
    // Parse the event
    const event = JSON.parse(req.rawBody);
    console.log(`Received platform event: ${event.type}`);
    
    // Process the event
    processEvent(event, false);
    
  } catch (err) {
    console.error(`Platform Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  res.send();
});

// Connect webhook endpoint
app.post('/connect-webhook', (req, res) => {
  const signature = req.headers['stripe-signature'];
  const secret = process.env.CONNECT_WEBHOOK_SECRET;
  
  if (!signature || !secret) {
    console.error('Missing signature or secret');
    return res.status(400).send('Missing signature or secret');
  }
  
  try {
    // Verify the signature
    const isValid = verifyStripeSignature(req.rawBody, signature, secret);
    
    if (!isValid) {
      console.error('Invalid signature');
      return res.status(400).send('Invalid signature');
    }
    
    // Parse the event
    const event = JSON.parse(req.rawBody);
    console.log(`Received connect event: ${event.type}`);
    
    // Process the event
    processEvent(event, true);
    
  } catch (err) {
    console.error(`Connect Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  res.send();
});

// API endpoint to get recent events
app.get('/api/events', (req, res) => {
  console.log('API request received for /api/events');
  // Set proper headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // Return empty array if no events
    if (!recentEvents || recentEvents.length === 0) {
      console.log('No events to return');
      return res.json([]);
    }
    
    console.log(`Returning ${recentEvents.length} events`);
    return res.json(recentEvents);
  } catch (error) {
    console.error('Error in /api/events endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// New endpoint to check if there are new events without sending all data
app.get('/api/events/check-new', (req, res) => {
  console.log('API request received for /api/events/check-new');
  // Set proper headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const clientLastTimestamp = req.query.lastTimestamp || '';
    
    // If client has no events yet, or if we have newer events
    const hasNewEvents = 
      clientLastTimestamp === '' || 
      (recentEvents.length > 0 && recentEvents[0].timestamp > clientLastTimestamp);
    
    return res.json({ hasNewEvents });
  } catch (error) {
    console.error('Error in /api/events/check-new endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to process events
function processEvent(event, isConnect) {
  // Update the last event timestamp when processing a new event
  lastEventTimestamp = new Date().toISOString();
  
  // Extract common data
  const timestamp = event.created 
    ? new Date(event.created * 1000).toISOString() 
    : new Date().toISOString();
  
  // Process based on event type
  switch (event.type) {
    // Charge events
    case 'charge.succeeded':
    case 'charge.failed':
      const charge = event.data.object;
      recentEvents.unshift({
        type: 'charge',
        status: charge.status,
        amount: charge.amount / 100,
        currency: charge.currency,
        country: charge.billing_details?.address?.country || null,
        timestamp: new Date(charge.created * 1000).toISOString(),
        details: `${isConnect ? 'Connect' : 'Platform'} ${charge.status === 'succeeded' ? 'charge succeeded' : 'charge failed'}`,
        connectAccount: isConnect ? event.account : null
      });
      break;
      
    // Customer events
    case 'customer.created':
    case 'customer.updated':
      const customer = event.data.object;
      recentEvents.unshift({
        type: 'customer',
        email: customer.email,
        timestamp: new Date(customer.created * 1000).toISOString(),
        details: `${isConnect ? 'Connect' : 'Platform'} ${event.type === 'customer.created' ? 'new customer' : 'customer updated'}`,
        connectAccount: isConnect ? event.account : null
      });
      break;
      
    // Application fee events
    case 'application_fee.created':
      const fee = event.data.object;
      recentEvents.unshift({
        type: 'fee',
        amount: fee.amount / 100,
        currency: fee.currency,
        timestamp: new Date(fee.created * 1000).toISOString(),
        details: `${isConnect ? 'Connect' : 'Platform'} application fee created`,
        connectAccount: isConnect ? event.account : null
      });
      break;
      
    // Subscription events
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      recentEvents.unshift({
        type: 'subscription',
        status: subscription.status,
        plan: subscription.items?.data[0]?.plan?.nickname || subscription.items?.data[0]?.price?.nickname || 'Unknown Plan',
        quantity: subscription.items?.data[0]?.quantity || 1,
        amount: (subscription.items?.data[0]?.plan?.amount || subscription.items?.data[0]?.price?.unit_amount || 0) / 100,
        currency: subscription.currency || subscription.items?.data[0]?.plan?.currency || subscription.items?.data[0]?.price?.currency || 'usd',
        email: subscription.customer_email || '',
        timestamp: new Date(subscription.created * 1000).toISOString(),
        details: `${isConnect ? 'Connect' : 'Platform'} ${event.type === 'customer.subscription.created' ? 'subscription created' : 'subscription updated'}`,
        connectAccount: isConnect ? event.account : null
      });
      break;
      
    // Subscription schedule events
    case 'subscription_schedule.updated':
    case 'subscription_schedule.released':
      const schedule = event.data.object;
      recentEvents.unshift({
        type: 'subscription_schedule',
        status: schedule.status,
        timestamp: new Date(schedule.created * 1000).toISOString(),
        details: `${isConnect ? 'Connect' : 'Platform'} ${event.type.replace('subscription_schedule.', 'subscription schedule ')}`,
        connectAccount: isConnect ? event.account : null
      });
      break;
      
    // Invoice events
    case 'invoice.created':
    case 'invoice.updated':
    case 'invoice.paid':
    case 'invoice.finalized':
    case 'invoice.upcoming':
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      recentEvents.unshift({
        type: 'invoice',
        status: invoice.status,
        amount: invoice.total / 100,
        currency: invoice.currency,
        email: invoice.customer_email || '',
        timestamp: new Date(invoice.created * 1000).toISOString(),
        details: `${isConnect ? 'Connect' : 'Platform'} ${event.type.replace('invoice.', 'invoice ')}`,
        connectAccount: isConnect ? event.account : null
      });
      break;
      
    // Checkout session events
    case 'checkout.session.expired':
      const session = event.data.object;
      recentEvents.unshift({
        type: 'checkout',
        status: 'expired',
        timestamp: new Date(session.created * 1000).toISOString(),
        details: `${isConnect ? 'Connect' : 'Platform'} checkout session expired`,
        connectAccount: isConnect ? event.account : null
      });
      break;
      
    // Payment intent events
    case 'payment_intent.created':
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      recentEvents.unshift({
        type: 'payment_intent',
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        timestamp: new Date(paymentIntent.created * 1000).toISOString(),
        details: `${isConnect ? 'Connect' : 'Platform'} ${event.type.replace('payment_intent.', 'payment intent ')}`,
        connectAccount: isConnect ? event.account : null
      });
      break;
      
    // Payment method events
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      recentEvents.unshift({
        type: 'payment_method',
        timestamp: timestamp,
        details: `${isConnect ? 'Connect' : 'Platform'} payment method attached`,
        connectAccount: isConnect ? event.account : null
      });
      break;
      
    // Default case for any other events
    default:
      console.log(`Unhandled event type: ${event.type}`);
      // Add a generic event for unhandled event types
      recentEvents.unshift({
        type: 'generic',
        timestamp: timestamp,
        details: `${isConnect ? 'Connect' : 'Platform'} ${event.type}`,
        connectAccount: isConnect ? event.account : null
      });
      break;
  }
  
  // Keep only the most recent events
  recentEvents = recentEvents.slice(0, 50);
}

// Static file serving - AFTER API routes to ensure API routes take precedence
app.use(express.static('dist'));

// Catch-all route for SPA - MUST be after API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve the index.html for all other routes (SPA)
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});