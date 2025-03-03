import React, { useState, useEffect } from 'react';
import { sampleEvents } from '../data/sampleData';
import '../tailwind.css';
import useSound from 'use-sound';
import { VolumeControl } from './VolumeControl';
import { MRR } from './MRR';
import { Nav } from './Nav';
import { Event } from '../types/Event';

export const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(8);
  const [isFlashing, setIsFlashing] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
  const DELAY = 5000;

  const [playSuccess] = useSound('/sounds/success.mp3', { volume: isMuted ? 0 : volume });
  const [playFailure] = useSound('/sounds/oh-brother.mp3', { volume: isMuted ? 0 : volume });
  const [playGeneric] = useSound('/sounds/generic.mp3', { volume: isMuted ? 0 : volume });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sampleEvents.length);
      setEvents((prev) => {
        const newEvent = sampleEvents[currentIndex];
        
        if (newEvent.details.toLowerCase().includes('failed')) {
          playFailure();
        } else if (newEvent.details.toLowerCase().includes('new customer')) {
          playGeneric();
        } else {
          playSuccess();
        }
        
        return [newEvent, ...prev].slice(0, 10);
      });
      setTimeLeft(8);
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Simplified color logic
  const getBackgroundColor = (event?: Event) => {
    if (!event) return 'bg-blue-50';
    
    if (event.details.toLowerCase().includes('failed')) {
      return 'bg-red-50';
    }
    
    if (event.details.toLowerCase().includes('new customer')) {
      return 'bg-blue-50';
    }
    
    return 'bg-green-50';
  };

  const getTextColor = (event?: Event) => {
    if (!event) return 'text-blue-800';
    
    if (event.details.toLowerCase().includes('failed')) {
      return 'text-red-800';
    }
    
    if (event.details.toLowerCase().includes('new customer')) {
      return 'text-blue-800';
    }
    
    return 'text-green-800';
  };

  // Add currency to country mapping
  const currencyToCountry = {
    USD: 'US',
    EUR: 'EU',
    GBP: 'GB',
    JPY: 'JP',
  } as const;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="p-4">
          
          {/* Commented out for now */}
          {/* <Nav activeTab={activeTab} onTabChange={setActiveTab} /> */}

          <VolumeControl 
            volume={volume}
            onVolumeChange={setVolume}
            isMuted={isMuted}
            onMuteChange={setIsMuted}
          />

          {/* Always show events for now */}
          <div className="flex justify-center items-center min-h-screen bg-white">
            <div className="p-4 pt-2">
              <div className={`w-[580px] h-[380px] rounded-3xl border-4 relative overflow-hidden ${
                events[0]?.details.toLowerCase().includes('failed') ? 'border-red-400' : 
                events[0]?.details.toLowerCase().includes('new customer') ? 'border-blue-400' : 
                'border-green-400'
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
                    {events[0]?.country || (events[0]?.currency && currencyToCountry[events[0].currency as keyof typeof currencyToCountry]) && (
                      <div className="absolute bottom-6 right-6">
                        <img 
                          src={`https://flagcdn.com/${
                            (events[0].country || currencyToCountry[events[0].currency as keyof typeof currencyToCountry]).toLowerCase()
                          }.svg`} 
                          alt={`${events[0].country || currencyToCountry[events[0].currency as keyof typeof currencyToCountry]} flag`}
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
            <style>{`
              @keyframes splash {
                0% { 
                  background-color: ${
                    events[0]?.details.toLowerCase().includes('failed') ? '#f87171' : 
                    events[0]?.details.toLowerCase().includes('new customer') ? '#60a5fa' : 
                    '#4ade80'
                  }; 
                }
                10% { 
                  background-color: ${
                    events[0]?.details.toLowerCase().includes('failed') ? '#f87171' : 
                    events[0]?.details.toLowerCase().includes('new customer') ? '#60a5fa' : 
                    '#4ade80'
                  }; 
                }
                100% { background-color: white; }
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
}; 