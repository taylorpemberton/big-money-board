/**
 * Data index file
 * 
 * This file exports all data-related modules for easier imports.
 */

// Export sample data
export * from './sampleData'

// Export Stripe payment data
export * from './PaymentsStripeData'

// Export platform events data
export * from './PlatformEventsData'

// Combined event types for the application
export const EVENT_CATEGORIES = {
  PAYMENT: 'payment',
  SUBSCRIPTION: 'subscription',
  CUSTOMER: 'customer',
  WORKOUT: 'workout',
  PROGRAM: 'program',
  USER: 'user',
  COACH: 'coach',
  BUSINESS: 'business'
}

// Event type to category mapping
export function getEventCategory(eventType: string): string {
  if (eventType.startsWith('payment_intent') || eventType.includes('charge')) {
    return EVENT_CATEGORIES.PAYMENT
  } else if (eventType.includes('subscription')) {
    return EVENT_CATEGORIES.SUBSCRIPTION
  } else if (eventType.startsWith('customer') && !eventType.includes('subscription')) {
    return EVENT_CATEGORIES.CUSTOMER
  } else if (eventType.includes('workout')) {
    return EVENT_CATEGORIES.WORKOUT
  } else if (eventType.includes('program')) {
    return EVENT_CATEGORIES.PROGRAM
  } else if (eventType.includes('user')) {
    return EVENT_CATEGORIES.USER
  } else if (eventType.includes('coach')) {
    return EVENT_CATEGORIES.COACH
  } else if (eventType.includes('business')) {
    return EVENT_CATEGORIES.BUSINESS
  }
  
  // Default category
  return 'other'
} 