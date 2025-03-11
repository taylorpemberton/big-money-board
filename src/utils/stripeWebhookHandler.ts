/**
 * stripeWebhookHandler.ts
 * 
 * Utility functions for handling Stripe webhook events.
 * This file provides a foundation for processing Stripe webhook events
 * when transitioning from test data to real data.
 */

import { Event } from '../types/Event'
import { 
  STRIPE_EVENT_TYPES, 
  StripeWebhookEvent,
  transformStripeEventToAppEvent 
} from '../data/PaymentsStripeData'

/**
 * Process a Stripe webhook event and return a standardized Event object
 */
export function processStripeWebhook(
  payload: any, 
  signature: string, 
  webhookSecret: string
): Event | null {
  try {
    // In a real implementation, you would verify the webhook signature
    // using the Stripe library:
    // const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    
    // For now, we'll just assume the payload is valid and properly formatted
    const stripeEvent = payload as StripeWebhookEvent
    
    // Transform the Stripe event to our application's Event format
    return transformStripeEventToAppEvent(stripeEvent)
  } catch (error) {
    console.error('Error processing Stripe webhook:', error)
    return null
  }
}

/**
 * Determine if a Stripe event should trigger a notification
 */
export function shouldNotifyOnStripeEvent(eventType: string): boolean {
  // Events that should trigger notifications
  const notifiableEvents = [
    STRIPE_EVENT_TYPES.PAYMENT.PAYMENT_INTENT_SUCCEEDED,
    STRIPE_EVENT_TYPES.PAYMENT.PAYMENT_INTENT_FAILED,
    STRIPE_EVENT_TYPES.INVOICE.PAYMENT_SUCCEEDED,
    STRIPE_EVENT_TYPES.INVOICE.PAYMENT_FAILED,
    STRIPE_EVENT_TYPES.SUBSCRIPTION.CREATED,
    STRIPE_EVENT_TYPES.SUBSCRIPTION.DELETED,
  ]
  
  return notifiableEvents.includes(eventType)
}

/**
 * Get a user-friendly message for a Stripe event
 */
export function getStripeEventMessage(event: Event): string {
  const { type, status, email } = event
  
  // Generate appropriate message based on event type
  if (type === STRIPE_EVENT_TYPES.PAYMENT.PAYMENT_INTENT_SUCCEEDED) {
    return `Payment succeeded${email ? ` for ${email}` : ''}`
  } else if (type === STRIPE_EVENT_TYPES.PAYMENT.PAYMENT_INTENT_FAILED) {
    return `Payment failed${email ? ` for ${email}` : ''}`
  } else if (type === STRIPE_EVENT_TYPES.INVOICE.PAYMENT_SUCCEEDED) {
    return `Invoice payment succeeded${email ? ` for ${email}` : ''}`
  } else if (type === STRIPE_EVENT_TYPES.INVOICE.PAYMENT_FAILED) {
    return `Invoice payment failed${email ? ` for ${email}` : ''}`
  } else if (type === STRIPE_EVENT_TYPES.SUBSCRIPTION.CREATED) {
    return `New subscription created${email ? ` for ${email}` : ''}`
  } else if (type === STRIPE_EVENT_TYPES.SUBSCRIPTION.DELETED) {
    return `Subscription canceled${email ? ` for ${email}` : ''}`
  } else if (type === STRIPE_EVENT_TYPES.SUBSCRIPTION.UPDATED) {
    return `Subscription updated${email ? ` for ${email}` : ''}`
  }
  
  // Default message for other event types
  return `Stripe event received: ${type}`
}

/**
 * Group Stripe events by customer for reporting
 */
export function groupStripeEventsByCustomer(events: Event[]): Record<string, Event[]> {
  return events.reduce((grouped, event) => {
    // Skip events without email (customer identifier)
    if (!event.email) return grouped
    
    // Create array for this customer if it doesn't exist
    if (!grouped[event.email]) {
      grouped[event.email] = []
    }
    
    // Add event to this customer's array
    grouped[event.email].push(event)
    
    return grouped
  }, {} as Record<string, Event[]>)
}

/**
 * Calculate revenue metrics from Stripe events
 */
export function calculateRevenueMetrics(events: Event[]): {
  totalRevenue: number
  successfulPayments: number
  failedPayments: number
  averageTransactionValue: number
  revenueByCurrency: Record<string, number>
} {
  // Initialize metrics
  let totalRevenue = 0
  let successfulPayments = 0
  let failedPayments = 0
  const revenueByCurrency: Record<string, number> = {}
  
  // Process each event
  events.forEach(event => {
    // Only process payment events with amount and currency
    if (!event.amount || !event.currency) return
    
    // Track revenue by currency
    if (!revenueByCurrency[event.currency]) {
      revenueByCurrency[event.currency] = 0
    }
    
    // Process successful payments
    if (
      (event.type === STRIPE_EVENT_TYPES.PAYMENT.PAYMENT_INTENT_SUCCEEDED ||
       event.type === STRIPE_EVENT_TYPES.INVOICE.PAYMENT_SUCCEEDED ||
       event.type === STRIPE_EVENT_TYPES.INVOICE.PAID) &&
      event.status === 'succeeded'
    ) {
      totalRevenue += event.amount
      revenueByCurrency[event.currency] += event.amount
      successfulPayments++
    }
    
    // Count failed payments
    if (
      (event.type === STRIPE_EVENT_TYPES.PAYMENT.PAYMENT_INTENT_FAILED ||
       event.type === STRIPE_EVENT_TYPES.INVOICE.PAYMENT_FAILED) &&
      event.status === 'failed'
    ) {
      failedPayments++
    }
  })
  
  // Calculate average transaction value
  const averageTransactionValue = successfulPayments > 0
    ? totalRevenue / successfulPayments
    : 0
  
  return {
    totalRevenue,
    successfulPayments,
    failedPayments,
    averageTransactionValue,
    revenueByCurrency
  }
} 