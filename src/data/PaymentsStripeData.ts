/**
 * PaymentsStripeData.ts
 * 
 * This file contains structured Stripe webhook event types that we receive
 * for our B2B2C fitness platform. These events will be used to transition
 * from test data to real data from Stripe.
 */

import { Event } from '../types/Event'

/**
 * Stripe webhook event types organized by category
 */
export const STRIPE_EVENT_TYPES = {
  // Payment related events
  PAYMENT: {
    PAYMENT_INTENT_CREATED: 'payment_intent.created',
    PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
    PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed',
    CHARGE_FAILED: 'charge.failed',
  },
  
  // Invoice related events
  INVOICE: {
    CREATED: 'invoice.created',
    UPDATED: 'invoice.updated',
    FINALIZED: 'invoice.finalized',
    PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
    PAYMENT_FAILED: 'invoice.payment_failed',
    PAID: 'invoice.paid',
    UPCOMING: 'invoice.upcoming',
  },
  
  // Customer related events
  CUSTOMER: {
    CREATED: 'customer.created',
    UPDATED: 'customer.updated',
  },
  
  // Subscription related events
  SUBSCRIPTION: {
    CREATED: 'customer.subscription.created',
    UPDATED: 'customer.subscription.updated',
    DELETED: 'customer.subscription.deleted',
  },
  
  // Setup intent related events
  SETUP_INTENT: {
    CREATED: 'setup_intent.created',
    SUCCEEDED: 'setup_intent.succeeded',
  },
}

/**
 * Primary webhook events we receive from Stripe
 */
export const PRIMARY_WEBHOOK_EVENTS = [
  STRIPE_EVENT_TYPES.CUSTOMER.CREATED,
  STRIPE_EVENT_TYPES.CUSTOMER.UPDATED,
  STRIPE_EVENT_TYPES.PAYMENT.PAYMENT_INTENT_CREATED,
  STRIPE_EVENT_TYPES.PAYMENT.PAYMENT_INTENT_SUCCEEDED,
  STRIPE_EVENT_TYPES.PAYMENT.PAYMENT_INTENT_FAILED,
  STRIPE_EVENT_TYPES.PAYMENT.CHARGE_FAILED,
  STRIPE_EVENT_TYPES.INVOICE.CREATED,
  STRIPE_EVENT_TYPES.INVOICE.UPDATED,
  STRIPE_EVENT_TYPES.INVOICE.FINALIZED,
  STRIPE_EVENT_TYPES.INVOICE.PAYMENT_SUCCEEDED,
  STRIPE_EVENT_TYPES.INVOICE.PAYMENT_FAILED,
  STRIPE_EVENT_TYPES.INVOICE.PAID,
  STRIPE_EVENT_TYPES.INVOICE.UPCOMING,
  STRIPE_EVENT_TYPES.SUBSCRIPTION.CREATED,
  STRIPE_EVENT_TYPES.SUBSCRIPTION.UPDATED,
  STRIPE_EVENT_TYPES.SUBSCRIPTION.DELETED,
  STRIPE_EVENT_TYPES.SETUP_INTENT.CREATED,
  STRIPE_EVENT_TYPES.SETUP_INTENT.SUCCEEDED,
]

/**
 * Connect webhook events we receive from Stripe
 */
export const CONNECT_WEBHOOK_EVENTS = [
  STRIPE_EVENT_TYPES.CUSTOMER.CREATED,
  STRIPE_EVENT_TYPES.CUSTOMER.UPDATED,
  STRIPE_EVENT_TYPES.PAYMENT.PAYMENT_INTENT_CREATED,
  STRIPE_EVENT_TYPES.PAYMENT.PAYMENT_INTENT_SUCCEEDED,
  STRIPE_EVENT_TYPES.PAYMENT.PAYMENT_INTENT_FAILED,
  STRIPE_EVENT_TYPES.PAYMENT.CHARGE_FAILED,
  STRIPE_EVENT_TYPES.INVOICE.CREATED,
  STRIPE_EVENT_TYPES.INVOICE.UPDATED,
  STRIPE_EVENT_TYPES.INVOICE.FINALIZED,
  STRIPE_EVENT_TYPES.INVOICE.PAYMENT_SUCCEEDED,
  STRIPE_EVENT_TYPES.INVOICE.PAYMENT_FAILED,
  STRIPE_EVENT_TYPES.INVOICE.PAID,
  STRIPE_EVENT_TYPES.INVOICE.UPCOMING,
  STRIPE_EVENT_TYPES.SUBSCRIPTION.UPDATED,
  STRIPE_EVENT_TYPES.SUBSCRIPTION.DELETED,
]

/**
 * Interface for Stripe webhook event data
 */
export interface StripeWebhookEvent {
  type: string
  timestamp: string
  data: {
    object: Record<string, any>
  }
}

/**
 * Future event types for the platform
 */
export const FUTURE_EVENT_TYPES = {
  PLATFORM: {
    WORKOUT_COMPLETED: 'platform.workout.completed',
    PROGRAM_ASSIGNED: 'platform.program.assigned',
    NEW_SIGNUP: 'platform.user.signup',
  }
}

/**
 * Sample function to transform Stripe webhook events to our Event interface
 */
export function transformStripeEventToAppEvent(stripeEvent: StripeWebhookEvent): Event {
  const { type, timestamp, data } = stripeEvent
  
  // Base event properties
  const event: Event = {
    type,
    timestamp,
    details: `Stripe event: ${type}`,
  }
  
  // Add specific properties based on event type
  if (type.startsWith('payment_intent')) {
    if (data.object.amount) {
      event.amount = data.object.amount / 100 // Convert from cents
      event.currency = data.object.currency
    }
    
    if (type === STRIPE_EVENT_TYPES.PAYMENT.PAYMENT_INTENT_SUCCEEDED) {
      event.status = 'succeeded'
    } else if (type === STRIPE_EVENT_TYPES.PAYMENT.PAYMENT_INTENT_FAILED) {
      event.status = 'failed'
    } else {
      event.status = 'pending'
    }
  } else if (type.startsWith('invoice')) {
    if (data.object.amount_paid) {
      event.amount = data.object.amount_paid / 100
      event.currency = data.object.currency
    }
    
    if (data.object.customer_email) {
      event.email = data.object.customer_email
    }
    
    if (type === STRIPE_EVENT_TYPES.INVOICE.PAYMENT_SUCCEEDED || 
        type === STRIPE_EVENT_TYPES.INVOICE.PAID) {
      event.status = 'succeeded'
    } else if (type === STRIPE_EVENT_TYPES.INVOICE.PAYMENT_FAILED) {
      event.status = 'failed'
    } else {
      event.status = 'pending'
    }
  } else if (type.startsWith('customer')) {
    if (data.object.email) {
      event.email = data.object.email
    }
    
    if (type.includes('subscription')) {
      if (data.object.plan) {
        event.plan = data.object.plan.nickname || data.object.plan.id
        event.amount = data.object.plan.amount / 100
        event.currency = data.object.plan.currency
      }
      
      if (data.object.quantity) {
        event.quantity = data.object.quantity
      }
    }
  }
  
  return event
} 