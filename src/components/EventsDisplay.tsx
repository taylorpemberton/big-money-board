/**
 * EventsDisplay.tsx
 * 
 * A component that displays events and allows toggling between test and real data.
 * This component integrates with the existing UI dropdown for data source selection.
 */

import { useState } from 'react'
import { useEvents } from '../hooks/useEvents'
import { EVENT_CATEGORIES } from '../data'
import { Event } from '../types/Event'

interface EventsDisplayProps {
  // Optional props for customization
  title?: string
  maxEvents?: number
  simulateNewEvents?: boolean
}

export function EventsDisplay({
  title = 'Recent Events',
  maxEvents = 50,
  simulateNewEvents = false
}: EventsDisplayProps) {
  // State for selected category filter
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  // Use our custom hook
  const {
    events,
    eventsByCategory,
    isLoading,
    error,
    refreshEvents,
    toggleDataSource,
    isUsingTestData,
    addRandomEvent,
    addNextEvent
  } = useEvents({
    maxEvents,
    simulateNewEvents,
    simulationInterval: 5000 // Add a new random event every 5 seconds if simulation is enabled
  })
  
  // Get filtered events based on selected category
  const filteredEvents = selectedCategory 
    ? eventsByCategory[selectedCategory] || []
    : events
  
  // Get available categories from the events
  const availableCategories = Object.keys(eventsByCategory)
  
  return (
    <div className="events-display">
      <div className="events-header">
        <h2>{title}</h2>
        
        <div className="events-controls">
          {/* Data source toggle - this would connect to your existing dropdown */}
          <div className="data-source-toggle">
            <span>Data Source:</span>
            <button 
              onClick={toggleDataSource}
              className={`source-button ${isUsingTestData ? 'active' : ''}`}
            >
              {isUsingTestData ? 'Test Data' : 'Real Data'}
            </button>
          </div>
          
          {/* Category filter */}
          <div className="category-filter">
            <span>Filter by:</span>
            <select 
              value={selectedCategory || ''} 
              onChange={(e) => setSelectedCategory(e.target.value || null)}
            >
              <option value="">All Events</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Refresh button */}
          <button 
            onClick={refreshEvents}
            disabled={isLoading}
            className="refresh-button"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          
          {/* Test buttons - only shown when using test data */}
          {isUsingTestData && (
            <div className="test-controls">
              {/* Random event button */}
              <button 
                onClick={addRandomEvent}
                className="add-event-button"
                title="Add a random event"
              >
                Random Event
              </button>
              
              {/* Next event button */}
              <button 
                onClick={addNextEvent}
                className="next-event-button"
                title="Cycle to the next predefined event"
              >
                Next Event
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="error-message">
          Error loading events: {error.message}
        </div>
      )}
      
      {/* Events list */}
      <div className="events-list">
        {isLoading && events.length === 0 ? (
          <div className="loading-message">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-message">No events found</div>
        ) : (
          <ul>
            {filteredEvents.map((event: Event, index: number) => (
              <li key={`${event.type}-${event.timestamp}-${index}`} className={`event-item ${event.status || ''}`}>
                <div className="event-time">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
                <div className="event-type">
                  {event.type}
                </div>
                <div className="event-details">
                  {event.details}
                  {event.amount && event.currency && (
                    <span className="event-amount">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: event.currency.toUpperCase()
                      }).format(event.amount)}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
} 