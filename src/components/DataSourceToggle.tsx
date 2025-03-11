/**
 * DataSourceToggle.tsx
 * 
 * A simple component for toggling between test and real data.
 * This is an example of how to integrate with your existing UI dropdown.
 */

import { useCallback } from 'react'
import { setDataSource, USE_TEST_DATA } from '../utils/dataSource'

interface DataSourceToggleProps {
  // Current data source state
  isUsingTestData?: boolean
  // Callback when data source changes
  onToggle?: (isUsingTestData: boolean) => void
  // Optional class name for styling
  className?: string
}

export function DataSourceToggle({
  isUsingTestData = USE_TEST_DATA,
  onToggle,
  className = ''
}: DataSourceToggleProps) {
  // Handle toggle
  const handleToggle = useCallback(() => {
    const newValue = !isUsingTestData
    // Update the global data source flag
    setDataSource(newValue)
    // Call the callback if provided
    if (onToggle) {
      onToggle(newValue)
    }
  }, [isUsingTestData, onToggle])
  
  return (
    <div className={`data-source-toggle ${className}`}>
      <span>Data Source:</span>
      <select 
        value={isUsingTestData ? 'test' : 'real'}
        onChange={(e) => {
          const newValue = e.target.value === 'test'
          setDataSource(newValue)
          if (onToggle) {
            onToggle(newValue)
          }
        }}
      >
        <option value="test">Test Data</option>
        <option value="real">Real Data</option>
      </select>
      
      {/* Alternative button UI */}
      <button 
        onClick={handleToggle}
        className={`source-button ${isUsingTestData ? 'test-data' : 'real-data'}`}
      >
        {isUsingTestData ? 'Using Test Data' : 'Using Real Data'}
      </button>
    </div>
  )
}

/**
 * Example of how to use this component with your existing UI
 */
/*
import { useState } from 'react'
import { DataSourceToggle } from './DataSourceToggle'
import { useEvents } from '../hooks/useEvents'

function YourExistingComponent() {
  // Local state for data source
  const [isUsingTestData, setIsUsingTestData] = useState(true)
  
  // Use our events hook
  const { events, isLoading, error } = useEvents({
    useTestData: isUsingTestData,
    onDataSourceChange: setIsUsingTestData
  })
  
  return (
    <div>
      {/* Your existing UI dropdown can be replaced or enhanced with this component *}
      <DataSourceToggle 
        isUsingTestData={isUsingTestData}
        onToggle={setIsUsingTestData}
      />
      
      {/* Rest of your component *}
      {isLoading ? (
        <p>Loading events...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={`${event.type}-${event.timestamp}`}>
              {event.details}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
*/ 