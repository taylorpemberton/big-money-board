/**
 * platformEventHandler.ts
 * 
 * Utility functions for handling platform-specific events.
 * This file provides a foundation for processing events related to
 * workouts, programs, and user activities in the fitness platform.
 */

import { Event } from '../types/Event'
import { 
  PLATFORM_EVENT_TYPES, 
  PlatformEvent,
  transformPlatformEventToAppEvent 
} from '../data/PlatformEventsData'

/**
 * Process a platform event and return a standardized Event object
 */
export function processPlatformEvent(event: PlatformEvent): Event {
  return transformPlatformEventToAppEvent(event)
}

/**
 * Determine if a platform event should trigger a notification
 */
export function shouldNotifyOnPlatformEvent(eventType: string): boolean {
  // Events that should trigger notifications
  const notifiableEvents = [
    PLATFORM_EVENT_TYPES.WORKOUT.COMPLETED,
    PLATFORM_EVENT_TYPES.PROGRAM.ASSIGNED,
    PLATFORM_EVENT_TYPES.PROGRAM.COMPLETED,
    PLATFORM_EVENT_TYPES.USER.SIGNUP,
    PLATFORM_EVENT_TYPES.COACH.FEEDBACK_GIVEN,
    PLATFORM_EVENT_TYPES.BUSINESS.CLIENT_ADDED,
  ]
  
  return notifiableEvents.includes(eventType)
}

/**
 * Get a user-friendly message for a platform event
 */
export function getPlatformEventMessage(event: Event): string {
  const { type, details } = event
  
  // For platform events, we can use the details field directly
  // as it's already formatted in a user-friendly way
  return details
}

/**
 * Calculate workout metrics from platform events
 */
export function calculateWorkoutMetrics(events: PlatformEvent[]): {
  totalWorkoutsCompleted: number
  totalWorkoutMinutes: number
  averageWorkoutDuration: number
  workoutCompletionsByUser: Record<string, number>
} {
  // Initialize metrics
  let totalWorkoutsCompleted = 0
  let totalWorkoutMinutes = 0
  const workoutCompletionsByUser: Record<string, number> = {}
  
  // Process each event
  events.forEach(event => {
    // Only process workout completed events
    if (event.type !== PLATFORM_EVENT_TYPES.WORKOUT.COMPLETED) return
    
    // Count total workouts
    totalWorkoutsCompleted++
    
    // Add workout duration if available
    if (event.data.duration) {
      totalWorkoutMinutes += event.data.duration
    }
    
    // Track workouts by user
    if (!workoutCompletionsByUser[event.userId]) {
      workoutCompletionsByUser[event.userId] = 0
    }
    workoutCompletionsByUser[event.userId]++
  })
  
  // Calculate average workout duration
  const averageWorkoutDuration = totalWorkoutsCompleted > 0
    ? totalWorkoutMinutes / totalWorkoutsCompleted
    : 0
  
  return {
    totalWorkoutsCompleted,
    totalWorkoutMinutes,
    averageWorkoutDuration,
    workoutCompletionsByUser
  }
}

/**
 * Calculate program metrics from platform events
 */
export function calculateProgramMetrics(events: PlatformEvent[]): {
  totalProgramsAssigned: number
  totalProgramsCompleted: number
  completionRate: number
  programsByPopularity: Record<string, number>
} {
  // Initialize metrics
  let totalProgramsAssigned = 0
  let totalProgramsCompleted = 0
  const programsByPopularity: Record<string, number> = {}
  
  // Process each event
  events.forEach(event => {
    // Count assigned programs
    if (event.type === PLATFORM_EVENT_TYPES.PROGRAM.ASSIGNED) {
      totalProgramsAssigned++
      
      // Track program popularity if program name is available
      if (event.data.programName) {
        const programName = event.data.programName
        if (!programsByPopularity[programName]) {
          programsByPopularity[programName] = 0
        }
        programsByPopularity[programName]++
      }
    }
    
    // Count completed programs
    if (event.type === PLATFORM_EVENT_TYPES.PROGRAM.COMPLETED) {
      totalProgramsCompleted++
    }
  })
  
  // Calculate completion rate
  const completionRate = totalProgramsAssigned > 0
    ? totalProgramsCompleted / totalProgramsAssigned
    : 0
  
  return {
    totalProgramsAssigned,
    totalProgramsCompleted,
    completionRate,
    programsByPopularity
  }
}

/**
 * Calculate user engagement metrics from platform events
 */
export function calculateUserEngagementMetrics(events: PlatformEvent[]): {
  totalSignups: number
  activeUsers: string[]
  usersByEngagement: Record<string, number>
  signupsByReferralSource: Record<string, number>
} {
  // Initialize metrics
  let totalSignups = 0
  const activeUserSet = new Set<string>()
  const userEngagement: Record<string, number> = {}
  const signupsByReferralSource: Record<string, number> = {}
  
  // Process each event
  events.forEach(event => {
    // Track user activity for all events
    activeUserSet.add(event.userId)
    
    // Increment user engagement count
    if (!userEngagement[event.userId]) {
      userEngagement[event.userId] = 0
    }
    userEngagement[event.userId]++
    
    // Count signups and track referral sources
    if (event.type === PLATFORM_EVENT_TYPES.USER.SIGNUP) {
      totalSignups++
      
      // Track referral source if available
      if (event.data.referralSource) {
        const source = event.data.referralSource
        if (!signupsByReferralSource[source]) {
          signupsByReferralSource[source] = 0
        }
        signupsByReferralSource[source]++
      }
    }
  })
  
  return {
    totalSignups,
    activeUsers: Array.from(activeUserSet),
    usersByEngagement: userEngagement,
    signupsByReferralSource
  }
}

/**
 * Group platform events by business for reporting
 */
export function groupPlatformEventsByBusiness(events: PlatformEvent[]): Record<string, PlatformEvent[]> {
  return events.reduce((grouped, event) => {
    // Skip events without businessId
    if (!event.businessId) return grouped
    
    // Create array for this business if it doesn't exist
    if (!grouped[event.businessId]) {
      grouped[event.businessId] = []
    }
    
    // Add event to this business's array
    grouped[event.businessId].push(event)
    
    return grouped
  }, {} as Record<string, PlatformEvent[]>)
} 