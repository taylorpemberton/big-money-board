/**
 * useEvents.ts
 * 
 * Custom hook for managing events data with support for both test and real data.
 * This hook integrates with the existing UI dropdown for toggling data sources.
 */

import { useState, useEffect, useCallback } from 'react'
import { Event } from '../types/Event'
import { 
  getEvents, 
  generateRandomEvent, 
  setDataSource, 
  USE_TEST_DATA,
  getNextTestEvent
} from '../utils/dataSource'
import { getEventCategory } from '../data/index'

interface UseEventsOptions {
  // Whether to use test data (true) or real data from API (false)
  useTestData?: boolean
  // Polling interval in milliseconds (default: 10 seconds)
  pollingInterval?: number
  // Maximum number of events to keep in state
  maxEvents?: number
  // Whether to automatically add random events for testing UI
  simulateNewEvents?: boolean
  // Interval for simulating new events in milliseconds (default: 5 seconds)
  simulationInterval?: number
  // Optional callback when data source changes
  onDataSourceChange?: (isUsingTestData: boolean) => void
}

interface UseEventsReturn {
  // All events
  events: Event[]
  // Events filtered by category
  eventsByCategory: Record<string, Event[]>
  // Loading state
  isLoading: boolean
  // Error state
  error: Error | null
  // Function to refresh events
  refreshEvents: () => Promise<void>
  // Function to toggle between test and real data
  toggleDataSource: () => void
  // Function to set data source directly
  setDataSource: (useTestData: boolean) => void
  // Current data source (test or real)
  isUsingTestData: boolean
  // Function to add a random event (for testing)
  addRandomEvent: () => void
  // Function to add the next predefined test event
  addNextEvent: () => void
}

export function useEvents({
  useTestData = USE_TEST_DATA,
  pollingInterval = 10000,
  maxEvents = 50,
  simulateNewEvents = false,
  simulationInterval = 5000,
  onDataSourceChange
}: UseEventsOptions = {}): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isUsingTestData, setIsUsingTestData] = useState(useTestData)
  
  // Group events by category
  const eventsByCategory = events.reduce((acc, event) => {
    const category = getEventCategory(event.type)
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(event)
    return acc
  }, {} as Record<string, Event[]>)
  
  // Function to fetch events
  const fetchEventsData = useCallback(async () => {
    setIsLoading(true)
    try {
      const fetchedEvents = await getEvents()
      setEvents(prevEvents => {
        // Combine new events with existing ones, remove duplicates, and sort
        const allEvents = [...fetchedEvents, ...prevEvents]
        const uniqueEvents = allEvents.filter((event, index, self) => 
          index === self.findIndex(e => e.timestamp === event.timestamp && e.type === event.type)
        )
        
        // Sort by timestamp (newest first) and limit to maxEvents
        return uniqueEvents
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, maxEvents)
      })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch events'))
      console.error('Error fetching events:', err)
    } finally {
      setIsLoading(false)
    }
  }, [maxEvents])
  
  // Function to refresh events
  const refreshEvents = useCallback(async () => {
    await fetchEventsData()
  }, [fetchEventsData])
  
  // Function to toggle between test and real data
  const toggleDataSource = useCallback(() => {
    setIsUsingTestData(prev => {
      const newValue = !prev
      // Update the global data source flag
      setDataSource(newValue)
      // Call the optional callback if provided
      if (onDataSourceChange) {
        onDataSourceChange(newValue)
      }
      return newValue
    })
  }, [onDataSourceChange])
  
  // Function to set data source directly
  const setDataSourceDirectly = useCallback((useTestData: boolean) => {
    setIsUsingTestData(useTestData)
    // Update the global data source flag
    setDataSource(useTestData)
    // Call the optional callback if provided
    if (onDataSourceChange) {
      onDataSourceChange(useTestData)
    }
  }, [onDataSourceChange])
  
  // Function to add a random event (for testing UI)
  const addRandomEvent = useCallback(() => {
    const newEvent = generateRandomEvent()
    setEvents(prevEvents => {
      const updatedEvents = [newEvent, ...prevEvents]
      return updatedEvents.slice(0, maxEvents)
    })
  }, [maxEvents])
  
  // Function to add the next predefined test event
  const addNextEvent = useCallback(() => {
    const nextEvent = getNextTestEvent()
    setEvents(prevEvents => {
      const updatedEvents = [nextEvent, ...prevEvents]
      return updatedEvents.slice(0, maxEvents)
    })
  }, [maxEvents])
  
  // Initial fetch and polling
  useEffect(() => {
    fetchEventsData()
    
    // Set up polling for real-time updates
    const pollingTimer = setInterval(() => {
      fetchEventsData()
    }, pollingInterval)
    
    return () => {
      clearInterval(pollingTimer)
    }
  }, [fetchEventsData, pollingInterval, isUsingTestData])
  
  // Simulate new events if enabled
  useEffect(() => {
    if (!simulateNewEvents) return
    
    const simulationTimer = setInterval(() => {
      addRandomEvent()
    }, simulationInterval)
    
    return () => {
      clearInterval(simulationTimer)
    }
  }, [addRandomEvent, simulateNewEvents, simulationInterval])
  
  return {
    events,
    eventsByCategory,
    isLoading,
    error,
    refreshEvents,
    toggleDataSource,
    setDataSource: setDataSourceDirectly,
    isUsingTestData,
    addRandomEvent,
    addNextEvent
  }
} 