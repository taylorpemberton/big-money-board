import React, { useState, useEffect } from 'react';
import { sampleEvents } from '../data/sampleData';
import '../tailwind.css';
import useSound from 'use-sound';

interface Event {
  type: string;
  status?: string;
  amount?: number;
  currency?: string;
  timestamp: string;
  details: string;
  email?: string;
  plan?: string;
  quantity?: number;
  country?: string;
}

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(8);
  const [isFlashing, setIsFlashing] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [mrr, setMrr] = useState(0);
  const [mrrHistory, setMrrHistory] = useState<number[]>([]);
  const [candleData, setCandleData] = useState<Array<{time: number, open: number, close: number, high: number, low: number}>>([]);
  const [volume, setVolume] = useState(0.5);
  
  const DELAY = 5000;

  const [playSuccess] = useSound('/sounds/success.mp3', { volume });
  const [playFailure] = useSound('/sounds/failure.mp3', { volume });
  const [playGeneric] = useSound('/sounds/generic.mp3', { volume });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sampleEvents.length);
      setEvents((prev) => {
        const newEvent = sampleEvents[currentIndex];
        
        if (newEvent.status === 'succeeded') {
          playSuccess();
        } else if (newEvent.status === 'failed') {
          playFailure();
        } else {
          playGeneric();
        }
        
        return [newEvent, ...prev].slice(0, 10);
      });
      setTimeLeft(8);
      
      // Trigger flash animation
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 5000);
      
    }, DELAY);

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 8));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [currentIndex, playSuccess, playFailure, playGeneric]);

  useEffect(() => {
    if (activeTab === 'mrr') {
      // Initialize candle data for 24 hours
      if (candleData.length === 0) {
        const initialData = Array.from({length: 24}, (_, i) => ({
          time: i,
          open: 10000,
          close: 10000,
          high: 10000,
          low: 10000
        }));
        setCandleData(initialData);
      }

      const mrrInterval = setInterval(() => {
        setCandleData(prev => {
          const currentHour = new Date().getHours();
          const currentCandle = prev[currentHour];
          
          // Generate random price movement
          const change = Math.random() * 500 - 250;
          const newPrice = Math.max(0, currentCandle.close + change);
          
          const updatedCandle = {
            ...currentCandle,
            close: newPrice,
            high: Math.max(currentCandle.high, newPrice),
            low: Math.min(currentCandle.low, newPrice)
          };
          
          const newData = [...prev];
          newData[currentHour] = updatedCandle;
          return newData;
        });
      }, 1000);

      return () => clearInterval(mrrInterval);
    }
  }, [activeTab, candleData]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Define the background color based on status
  const getBackgroundColor = (event?: Event) => {
    if (!event) return 'bg-blue-50';
    
    // Check for failure keywords
    if (event.status === 'failed' || 
        event.details.toLowerCase().includes('failed') ||
        event.details.toLowerCase().includes('declined')) {
      return 'bg-red-50';
    }
    
    // Check for positive money events
    if ((event.amount && event.amount > 0) || 
        event.details.toLowerCase().includes('charged')) {
      return 'bg-green-50';
    }
    
    // Customer signups are always blue
    if (event.type === 'signup') return 'bg-blue-50';
    
    // Default to blue
    return 'bg-blue-50';
  };

  // Define the text color based on status
  const getTextColor = (event?: Event) => {
    if (!event) return 'text-blue-800';
    
    // Check for failure keywords
    if (event.status === 'failed' || 
        event.details.toLowerCase().includes('failed') ||
        event.details.toLowerCase().includes('declined')) {
      return 'text-red-800';
    }
    
    // Check for positive money events
    if ((event.amount && event.amount > 0) || 
        event.details.toLowerCase().includes('charged')) {
      return 'text-green-800';
    }
    
    // Customer signups are always blue
    if (event.type === 'signup') return 'text-blue-800';
    
    // Default to blue
    return 'text-blue-800';
  };

  // Add currency to country mapping
  const currencyToCountry = {
    USD: 'US',
    EUR: 'EU',
    GBP: 'GB',
    JPY: 'JP',
    // Add more mappings as needed
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="p-4">
          
          {/* iOS-style glossy tabs */}
          <div className="flex justify-center mb-4 bg-gray-100 p-1 rounded-full w-fit mx-auto shadow-inner">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-2 rounded-full transition-all duration-200 ${
                activeTab === 'events' 
                  ? 'bg-white shadow-lg text-blue-500' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab('mrr')}
              className={`px-6 py-2 rounded-full transition-all duration-200 ${
                activeTab === 'mrr' 
                  ? 'bg-white shadow-lg text-blue-500' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              MRR
            </button>
          </div>

          {/* Add volume control */}
          <div className="flex items-center justify-center mt-4 space-x-2">
            <span className="text-gray-600">🔈</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-48 accent-blue-500"
            />
            <span className="text-gray-600">{Math.round(volume * 100)}%</span>
          </div>

          {activeTab === 'events' ? (
            <div className="flex justify-center items-center min-h-screen bg-white">
              <div className="p-4 pt-2">
                <h1 className="text-2xl font-bold mb-4 text-center">Big Money Board</h1>
                
                <div className={`w-[580px] h-[380px] rounded-3xl border-4 relative overflow-hidden ${
                  events[0]?.type === 'signup' ? 'border-blue-400' : 
                  (events[0]?.amount && events[0].amount > 0) || 
                  (events[0]?.details.toLowerCase().includes('charged')) ? 'border-green-400' : 
                  events[0]?.status === 'failed' || 
                  events[0]?.details.toLowerCase().includes('failed') ||
                  events[0]?.details.toLowerCase().includes('declined') ? 'border-red-400' : 'border-blue-400'
                }`}>
                  {events[0] && (
                    <div
                      className={`w-full h-full p-6 transition-colors duration-500 ${
                        getBackgroundColor(events[0])
                      } ${getTextColor(events[0])}`}
                      style={{
                        animation: isFlashing 
                          ? 'splash 1s ease-out' 
                          : 'none'
                      }}
                    >
                      {/* Date in top right */}
                      <div className="absolute top-6 right-6 text-sm">
                        {new Date(events[0].timestamp).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="font-medium text-lg">{events[0].details}</span>
                        {events[0].amount ? (
                          <span className="text-9xl font-semibold mt-4">
                            {formatCurrency(events[0].amount, events[0].currency || 'USD')}
                          </span>
                        ) : (
                          <span className="text-9xl font-semibold mt-4">😃</span>
                        )}
                      </div>
                      
                      {/* Timestamp in bottom left */}
                      <div className="absolute bottom-6 left-6 text-sm">
                        {new Date(events[0].timestamp).toLocaleTimeString()}
                      </div>

                      {/* Country flag in bottom right */}
                      {events[0]?.country || (events[0]?.currency && currencyToCountry[events[0].currency]) && (
                        <div className="absolute bottom-6 right-6">
                          <img 
                            src={`https://flagcdn.com/${
                              (events[0].country || currencyToCountry[events[0].currency]).toLowerCase()
                            }.svg`} 
                            alt={`${events[0].country || currencyToCountry[events[0].currency]} flag`}
                            className="w-16 h-12"
                          />
                        </div>
                      )}

                      {events[0].email && (
                        <div className="mt-3 text-base">{events[0].email}</div>
                      )}
                      {events[0].plan && (
                        <div className="mt-3 text-base">
                          Plan: {events[0].plan} (Qty: {events[0].quantity})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Updated splash animation */}
              <style jsx>{`
                @keyframes splash {
                  0% { 
                    background-color: ${
                      events[0]?.type === 'signup' ? '#60a5fa' : 
                      (events[0]?.amount && events[0].amount > 0) ? '#4ade80' : 
                      events[0]?.status === 'failed' ? '#f87171' : '#60a5fa'
                    }; 
                  }
                  10% { 
                    background-color: ${
                      events[0]?.type === 'signup' ? '#60a5fa' : 
                      (events[0]?.amount && events[0].amount > 0) ? '#4ade80' : 
                      events[0]?.status === 'failed' ? '#f87171' : '#60a5fa'
                    }; 
                  }
                  100% { background-color: white; }
                }
              `}</style>
            </div>
          ) : (
            <div className="w-[580px] h-[380px] rounded-3xl border-4 border-blue-400 p-6 relative">
              <div className="flex flex-col h-full">
                <h2 className="text-2xl font-bold mb-4">Monthly Recurring Revenue</h2>
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-6xl font-bold">
                    {formatCurrency(mrr, 'USD')}
                  </span>
                </div>
                <div className="h-32 w-full">
                  <CandleChart data={candleData} />
                </div>
              </div>
              
              {/* Event cell in bottom right */}
              {events[0] && (
                <div className="absolute bottom-4 right-4 w-48 p-3 rounded-lg">
                  <div className="text-sm font-medium">{events[0].details}</div>
                  {events[0].amount ? (
                    <div className="text-lg font-semibold mt-1">
                      {formatCurrency(events[0].amount, events[0].currency || 'USD')}
                    </div>
                  ) : (
                    <div className="text-lg font-semibold mt-1">😃</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(events[0].timestamp).toLocaleTimeString()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// LineChart component
const LineChart = ({ data }: { data: number[] }) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);

  return (
    <div className="relative w-full h-full">
      {data.map((value, index) => (
        <div
          key={index}
          className="absolute bottom-0"
          style={{
            left: `${(index / (data.length - 1)) * 100}%`,
            height: `${((value - minValue) / (maxValue - minValue)) * 100}%`,
            width: `${100 / data.length}%`
          }}
        >
          <div className="bg-blue-400 w-full h-full rounded-t" />
        </div>
      ))}
    </div>
  );
};

// CandleChart component
const CandleChart = ({ data }: { data: Array<{time: number, open: number, close: number, high: number, low: number}> }) => {
  const maxValue = Math.max(...data.map(d => d.high));
  const minValue = Math.min(...data.map(d => d.low));

  return (
    <div className="w-full h-full flex items-end justify-between">
      {data.map((candle, index) => {
        const isUp = candle.close >= candle.open;
        const color = isUp ? 'bg-green-500' : 'bg-red-500';
        
        return (
          <div key={index} className="flex flex-col items-center h-full" style={{ width: `${100 / 24}%` }}>
            {/* Wick */}
            <div
              className="w-px bg-gray-400"
              style={{
                height: `${((candle.high - candle.low) / (maxValue - minValue)) * 100}%`
              }}
            />
            {/* Candle body */}
            <div
              className={`w-3/4 ${color} rounded-sm`}
              style={{
                height: `${(Math.abs(candle.close - candle.open) / (maxValue - minValue)) * 100}%`
              }}
            />
            {/* Hour label */}
            <div className="text-xs text-gray-500 mt-1">
              {candle.time}:00
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default App; 

