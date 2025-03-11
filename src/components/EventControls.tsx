/**
 * EventControls.tsx
 * 
 * A specialized component for controlling event playback in the test mode.
 * Provides play/pause and next buttons for simulating events.
 */

import { useState, useEffect, useCallback } from 'react'
import { useEvents } from '../hooks/useEvents'
import '../styles/EventControls.css'

interface EventControlsProps {
  // Whether simulation is initially enabled
  initialSimulation?: boolean
  // Interval for simulating events in milliseconds
  simulationInterval?: number
  // Optional class name for styling
  className?: string
}

export function EventControls({
  initialSimulation = false,
  simulationInterval = 5000,
  className = ''
}: EventControlsProps) {
  // State for simulation
  const [isSimulating, setIsSimulating] = useState(initialSimulation)
  
  // Use our events hook
  const { 
    isUsingTestData, 
    addRandomEvent, 
    addNextEvent 
  } = useEvents({
    simulateNewEvents: isSimulating,
    simulationInterval
  })
  
  // Toggle simulation
  const toggleSimulation = useCallback(() => {
    setIsSimulating(prev => !prev)
  }, [])
  
  // Handle next event
  const handleNextEvent = useCallback(() => {
    addNextEvent()
  }, [addNextEvent])
  
  // Disable simulation if not using test data
  useEffect(() => {
    if (!isUsingTestData && isSimulating) {
      setIsSimulating(false)
    }
  }, [isUsingTestData, isSimulating])
  
  // Don't render if not using test data
  if (!isUsingTestData) return null
  
  return (
    <div className={`event-controls ${className}`}>
      {/* Play/Pause button */}
      <button 
        onClick={toggleSimulation}
        className={`simulation-toggle ${isSimulating ? 'playing' : 'paused'}`}
        title={isSimulating ? 'Pause event simulation' : 'Start event simulation'}
      >
        {isSimulating ? '⏸️ Pause' : '▶️ Play'}
      </button>
      
      {/* Next button */}
      <button 
        onClick={handleNextEvent}
        className="next-event"
        title="Show next predefined event"
      >
        ⏭️ Next
      </button>
    </div>
  )
}

/**
 * Example of how to use this component in your UI
 */
/*
import { EventControls } from './EventControls'

function YourComponent() {
  return (
    <div className="dashboard">
      <header>
        <h1>Dashboard</h1>
        <EventControls />
      </header>
      
      {/* Rest of your dashboard *}
    </div>
  )
}
*/ 