/**
 * PlatformEventsData.ts
 * 
 * This file contains structured event types for platform-specific events
 * in our B2B2C fitness platform. These events will be used to track user
 * engagement and business metrics.
 */

import { Event } from '../types/Event'

/**
 * Platform-specific event types organized by category
 */
export const PLATFORM_EVENT_TYPES = {
  // Workout related events
  WORKOUT: {
    COMPLETED: 'platform.workout.completed',
    STARTED: 'platform.workout.started',
    SKIPPED: 'platform.workout.skipped',
    SCHEDULED: 'platform.workout.scheduled',
  },
  
  // Program related events
  PROGRAM: {
    ASSIGNED: 'platform.program.assigned',
    COMPLETED: 'platform.program.completed',
    PROGRESS_UPDATED: 'platform.program.progress_updated',
  },
  
  // User related events
  USER: {
    SIGNUP: 'platform.user.signup',
    LOGIN: 'platform.user.login',
    PROFILE_UPDATED: 'platform.user.profile_updated',
    GOAL_SET: 'platform.user.goal_set',
  },
  
  // Coach related events
  COACH: {
    ASSIGNED: 'platform.coach.assigned',
    FEEDBACK_GIVEN: 'platform.coach.feedback_given',
    MESSAGE_SENT: 'platform.coach.message_sent',
  },
  
  // Business related events
  BUSINESS: {
    CLIENT_ADDED: 'platform.business.client_added',
    SUBSCRIPTION_CHANGED: 'platform.business.subscription_changed',
    STAFF_ADDED: 'platform.business.staff_added',
  },
}

/**
 * Interface for platform event data
 */
export interface PlatformEvent {
  type: string
  timestamp: string
  userId: string
  businessId?: string
  coachId?: string
  data: Record<string, any>
}

/**
 * Sample function to transform platform events to our Event interface
 */
export function transformPlatformEventToAppEvent(platformEvent: PlatformEvent): Event {
  const { type, timestamp, data } = platformEvent
  
  // Base event properties
  const event: Event = {
    type,
    timestamp,
    details: `${type.replace('platform.', '').replace('.', ' ')}`,
  }
  
  // Add specific properties based on event type
  if (type === PLATFORM_EVENT_TYPES.WORKOUT.COMPLETED) {
    const workoutName = data.workoutName || 'Workout';
    event.details = `${workoutName} workout completed`;
  } 
  else if (type === PLATFORM_EVENT_TYPES.WORKOUT.STARTED) {
    const workoutName = data.workoutName || 'Workout';
    event.details = `${workoutName} workout started`;
  }
  else if (type === PLATFORM_EVENT_TYPES.PROGRAM.ASSIGNED) {
    const programName = data.programName || 'Program';
    event.details = `${programName} program assigned`;
  }
  else if (type === PLATFORM_EVENT_TYPES.PROGRAM.COMPLETED) {
    const programName = data.programName || 'Program';
    event.details = `${programName} program completed`;
  }
  else if (type === PLATFORM_EVENT_TYPES.USER.SIGNUP) {
    const referralSource = data.referralSource ? ` via ${data.referralSource}` : '';
    event.details = `New user signup${referralSource}`;
  }
  else if (type === PLATFORM_EVENT_TYPES.COACH.ASSIGNED) {
    event.details = `Coach assigned`;
  }
  else if (type === PLATFORM_EVENT_TYPES.BUSINESS.CLIENT_ADDED) {
    event.details = `New client added`;
  }
  
  return event
}

/**
 * Sample data for platform events (for testing purposes)
 */
export const SAMPLE_PLATFORM_EVENTS: PlatformEvent[] = [
  {
    type: PLATFORM_EVENT_TYPES.WORKOUT.COMPLETED,
    timestamp: new Date().toISOString(),
    userId: 'user_123',
    data: {
      workoutName: 'Full Body HIIT',
      duration: 45,
      caloriesBurned: 320,
      exercises: ['Burpees', 'Mountain Climbers', 'Jumping Jacks']
    }
  },
  {
    type: PLATFORM_EVENT_TYPES.PROGRAM.ASSIGNED,
    timestamp: new Date().toISOString(),
    userId: 'user_456',
    coachId: 'coach_789',
    data: {
      programName: '12-Week Strength Builder',
      difficulty: 'Intermediate',
      workoutsPerWeek: 4,
      goals: ['Strength', 'Muscle Gain']
    }
  },
  {
    type: PLATFORM_EVENT_TYPES.USER.SIGNUP,
    timestamp: new Date().toISOString(),
    userId: 'user_789',
    businessId: 'business_123',
    data: {
      referralSource: 'Instagram Campaign',
      initialGoals: ['Weight Loss', 'Improved Fitness'],
      fitnessLevel: 'Beginner'
    }
  }
] 