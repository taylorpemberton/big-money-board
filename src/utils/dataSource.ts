/**
 * dataSource.ts
 * 
 * This utility file helps toggle between test data and real data
 * for the B2B2C fitness platform dashboard.
 */

import { Event } from '../types/Event'
import { fetchEvents } from '../api/stripeApi'
import { 
  SAMPLE_PLATFORM_EVENTS, 
  transformPlatformEventToAppEvent 
} from '../data/PlatformEventsData'
import {
  STRIPE_EVENT_TYPES
} from '../data/PaymentsStripeData'

// Flag to toggle between test data and real data
// This can be controlled by your existing UI dropdown
export let USE_TEST_DATA = true

// Function to set the data source flag
export function setDataSource(useTestData: boolean): void {
  USE_TEST_DATA = useTestData
  console.log(`Data source set to: ${useTestData ? 'Test Data' : 'Real Data'}`)
}

/**
 * Get events from the appropriate data source based on the USE_TEST_DATA flag
 */
export async function getEvents(): Promise<Event[]> {
  if (USE_TEST_DATA) {
    return getTestEvents()
  } else {
    return getRealEvents()
  }
}

/**
 * Predefined test events for cycling through with the "Next Event" button
 */
export const PREDEFINED_TEST_EVENTS: Event[] = [
  // Payment events
  {
    type: STRIPE_EVENT_TYPES.PAYMENT.PAYMENT_INTENT_SUCCEEDED,
    status: 'succeeded',
    amount: 49.99,
    currency: 'usd',
    timestamp: new Date().toISOString(),
    details: 'Payment succeeded for customer@example.com',
    email: 'customer@example.com'
  },
  {
    type: STRIPE_EVENT_TYPES.PAYMENT.PAYMENT_INTENT_FAILED,
    status: 'failed',
    amount: 29.99,
    currency: 'usd',
    timestamp: new Date().toISOString(),
    details: 'Payment failed for declined@example.com',
    email: 'declined@example.com'
  },
  // Invoice events
  {
    type: STRIPE_EVENT_TYPES.INVOICE.PAYMENT_SUCCEEDED,
    status: 'succeeded',
    amount: 99.99,
    currency: 'eur',
    timestamp: new Date().toISOString(),
    details: 'Invoice payment succeeded for business@example.com',
    email: 'business@example.com'
  },
  {
    type: STRIPE_EVENT_TYPES.INVOICE.PAYMENT_FAILED,
    status: 'failed',
    amount: 79.99,
    currency: 'usd',
    timestamp: new Date().toISOString(),
    details: 'Invoice payment failed for failed@example.com',
    email: 'failed@example.com'
  },
  // Subscription events
  {
    type: STRIPE_EVENT_TYPES.SUBSCRIPTION.CREATED,
    status: 'active',
    amount: 19.99,
    currency: 'usd',
    timestamp: new Date().toISOString(),
    details: 'New subscription created for newuser@example.com',
    email: 'newuser@example.com',
    plan: 'Premium Monthly'
  },
  {
    type: STRIPE_EVENT_TYPES.SUBSCRIPTION.UPDATED,
    status: 'active',
    amount: 29.99,
    currency: 'gbp',
    timestamp: new Date().toISOString(),
    details: 'Subscription updated for existinguser@example.com',
    email: 'existinguser@example.com',
    plan: 'Premium Annual'
  },
  {
    type: STRIPE_EVENT_TYPES.SUBSCRIPTION.DELETED,
    status: 'canceled',
    timestamp: new Date().toISOString(),
    details: 'Subscription canceled for canceleduser@example.com',
    email: 'canceleduser@example.com'
  },
  // Customer events
  {
    type: STRIPE_EVENT_TYPES.CUSTOMER.CREATED,
    timestamp: new Date().toISOString(),
    details: 'New customer created: newclient@example.com',
    email: 'newclient@example.com'
  },
  // Platform events - Workout
  {
    type: 'platform.workout.completed',
    timestamp: new Date().toISOString(),
    details: 'Full Body HIIT workout completed'
  },
  {
    type: 'platform.workout.started',
    timestamp: new Date().toISOString(),
    details: 'Cardio Blast workout started'
  },
  // Platform events - Program
  {
    type: 'platform.program.assigned',
    timestamp: new Date().toISOString(),
    details: '12-Week Strength Builder program assigned'
  },
  {
    type: 'platform.program.completed',
    timestamp: new Date().toISOString(),
    details: '30-Day Challenge program completed'
  },
  // Platform events - User
  {
    type: 'platform.user.signup',
    timestamp: new Date().toISOString(),
    details: 'New user signup via Instagram'
  }
]

// Track the current index for cycling through predefined events
let currentEventIndex = 0

/**
 * Get the next predefined test event and update the timestamp
 */
export function getNextTestEvent(): Event {
  // Get the next event
  const event = { ...PREDEFINED_TEST_EVENTS[currentEventIndex] }
  
  // Update the timestamp to now
  event.timestamp = new Date().toISOString()
  
  // Increment the index and wrap around if needed
  currentEventIndex = (currentEventIndex + 1) % PREDEFINED_TEST_EVENTS.length
  
  return event
}

/**
 * Get the previous predefined test event and update the timestamp
 */
export function getPreviousTestEvent(): Event {
  // Decrement the index and wrap around if needed
  currentEventIndex = (currentEventIndex - 1 + PREDEFINED_TEST_EVENTS.length) % PREDEFINED_TEST_EVENTS.length
  
  // Get the previous event
  const event = { ...PREDEFINED_TEST_EVENTS[currentEventIndex] }
  
  // Update the timestamp to now
  event.timestamp = new Date().toISOString()
  
  return event
}

/**
 * Get test events from our sample data
 */
function getTestEvents(): Event[] {
  // Generate some sample Stripe payment events
  const stripeEvents: Event[] = [
    {
      type: STRIPE_EVENT_TYPES.PAYMENT.PAYMENT_INTENT_SUCCEEDED,
      status: 'succeeded',
      amount: 49.99,
      currency: 'usd',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      details: 'Payment succeeded for customer@example.com',
      email: 'customer@example.com'
    },
    {
      type: STRIPE_EVENT_TYPES.INVOICE.PAYMENT_SUCCEEDED,
      status: 'succeeded',
      amount: 99.99,
      currency: 'usd',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      details: 'Invoice payment succeeded for business@example.com',
      email: 'business@example.com'
    },
    {
      type: STRIPE_EVENT_TYPES.SUBSCRIPTION.CREATED,
      status: 'active',
      amount: 19.99,
      currency: 'cad',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      details: 'New subscription created for newuser@example.com',
      email: 'newuser@example.com',
      plan: 'Premium Monthly'
    },
    {
      type: STRIPE_EVENT_TYPES.CUSTOMER.CREATED,
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
      details: 'New customer created: client@example.com',
      email: 'client@example.com'
    },
    {
      type: STRIPE_EVENT_TYPES.PAYMENT.PAYMENT_INTENT_FAILED,
      status: 'failed',
      amount: 29.99,
      currency: 'usd',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      details: 'Payment failed for declined@example.com',
      email: 'declined@example.com'
    }
  ]
  
  // Transform platform events to the Event format
  const platformEvents = SAMPLE_PLATFORM_EVENTS.map(event => 
    transformPlatformEventToAppEvent(event)
  )
  
  // Combine and sort all events by timestamp (newest first)
  return [...stripeEvents, ...platformEvents]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

/**
 * Get real events from the API
 */
async function getRealEvents(): Promise<Event[]> {
  try {
    return await fetchEvents()
  } catch (error) {
    console.error('Error fetching real events:', error)
    // Fallback to test data if API fails
    console.log('Falling back to test data due to API error')
    return getTestEvents()
  }
}

/**
 * Generate a random event for testing (useful for simulating real-time updates)
 */
export function generateRandomEvent(): Event {
  const eventTypes = [
    STRIPE_EVENT_TYPES.PAYMENT.PAYMENT_INTENT_SUCCEEDED,
    STRIPE_EVENT_TYPES.INVOICE.PAYMENT_SUCCEEDED,
    STRIPE_EVENT_TYPES.SUBSCRIPTION.CREATED,
    'platform.workout.completed',
    'platform.program.assigned',
    'platform.user.signup'
  ]
  
  const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
  const timestamp = new Date().toISOString()
  
  if (randomType.startsWith('payment_intent') || randomType.startsWith('invoice')) {
    return {
      type: randomType,
      status: 'succeeded',
      amount: Math.floor(Math.random() * 100) + 9.99,
      currency: 'usd',
      timestamp,
      details: `Random ${randomType.replace('.', ' ')} event`,
      email: `user${Math.floor(Math.random() * 1000)}@example.com`
    }
  } else if (randomType.startsWith('customer.subscription')) {
    return {
      type: randomType,
      status: 'active',
      amount: Math.floor(Math.random() * 50) + 9.99,
      currency: 'usd',
      timestamp,
      details: `Random ${randomType.replace('.', ' ')} event`,
      email: `user${Math.floor(Math.random() * 1000)}@example.com`,
      plan: 'Random Plan'
    }
  } else {
    // Platform events
    if (randomType === 'platform.workout.completed') {
      return {
        type: randomType,
        timestamp,
        details: 'Full Body HIIT workout completed'
      }
    } else if (randomType === 'platform.workout.started') {
      return {
        type: randomType,
        timestamp,
        details: 'Cardio Blast workout started'
      }
    } else if (randomType === 'platform.program.assigned') {
      return {
        type: randomType,
        timestamp,
        details: '12-Week Strength Builder program assigned'
      }
    } else if (randomType === 'platform.program.completed') {
      return {
        type: randomType,
        timestamp,
        details: '30-Day Challenge program completed'
      }
    } else if (randomType === 'platform.user.signup') {
      return {
        type: randomType,
        timestamp,
        details: 'New user signup via Instagram'
      }
    } else {
      return {
        type: randomType,
        timestamp,
        details: `${randomType.replace('platform.', '').replace('.', ' ')}`
      }
    }
  }
} 