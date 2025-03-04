import React, { useState, useEffect, useRef } from 'react';
import { sampleEvents } from '../data/sampleData';
import '../tailwind.css';
import useSound from 'use-sound';
import { VolumeControl } from './VolumeControl';
import { Event } from '../types/Event';
import supersetLogo from '../assets/superset-logo.svg';
import { FaPause, FaPlay } from 'react-icons/fa';
import { getEventColors } from '../utils/eventStyles';
import { formatCurrency } from '../utils/formatting';
import { currencyToCountry, getFlagEmoji } from '../utils/flags';
import { getSplashAnimation } from '../utils/animations';

const USD_CONVERSION_RATES: Record<string, number> = {
  EUR: 1.08,
  GBP: 1.26,
  JPY: 0.0067,
  CAD: 0.74,
  AUD: 0.65,
  INR: 0.012
};

export const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(8);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showInternationalOnly, setShowInternationalOnly] = useState(false);
  const [lastEventWasFailed, setLastEventWasFailed] = useState(false);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [previousDailyRevenue, setPreviousDailyRevenue] = useState(0);
  const [revenueChangeType, setRevenueChangeType] = useState<'increase' | 'decrease' | null>(null);
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('volume');
    return savedVolume ? parseFloat(savedVolume) : 0.5;
  });
  const [isMuted, setIsMuted] = useState(() => {
    const savedMuted = localStorage.getItem('isMuted');
    return savedMuted ? JSON.parse(savedMuted) : false;
  });
  const [isSydneyMuted, setIsSydneyMuted] = useState(() => {
    const savedSydneyMuted = localStorage.getItem('isSydneyMuted');
    return savedSydneyMuted ? JSON.parse(savedSydneyMuted) : false;
  });
  
  const DELAY = 5000;

  const [playSuccess] = useSound('/big-money-board/sounds/success.mp3', { 
    volume: isMuted ? 0 : volume,
    interrupt: true 
  });
  const [playFailure] = useSound('/big-money-board/sounds/oh-brother.mp3', { 
    volume: isSydneyMuted ? 0 : volume,
    interrupt: true 
  });
  const [playGeneric] = useSound('/big-money-board/sounds/generic.mp3', { 
    volume: isMuted ? 0 : volume,
    interrupt: true 
  });

  const amountRef = useRef<HTMLSpanElement>(null);
  const [amountFontSize, setAmountFontSize] = useState('text-7xl sm:text-[120px]');

  // Save volume and mute states to localStorage
  useEffect(() => {
    localStorage.setItem('volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('isMuted', JSON.stringify(isMuted));
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem('isSydneyMuted', JSON.stringify(isSydneyMuted));
  }, [isSydneyMuted]);

  // Add initial event when component mounts
  useEffect(() => {
    // Create a standalone fake success event
    const initialEvent: Event = {
      type: 'charge',
      status: 'succeeded',
      amount: 42.99,
      currency: 'USD',
      country: 'US',
      timestamp: new Date().toISOString(),
      details: 'Application Fee charged',
      email: 'customer@example.com'
    };
    
    setEvents([initialEvent]);
    playSuccess();
  }, [playSuccess]);

  // Calculate daily revenue
  useEffect(() => {
    // Reset daily revenue at midnight
    const resetDailyRevenue = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setPreviousDailyRevenue(0);
        setDailyRevenue(0);
        setRevenueChangeType(null);
      }
    };

    // Check for midnight reset every minute
    const midnightCheckInterval = setInterval(resetDailyRevenue, 60000);
    
    return () => clearInterval(midnightCheckInterval);
  }, []);

  // Track revenue changes and flash effect
  useEffect(() => {
    if (dailyRevenue > previousDailyRevenue) {
      setRevenueChangeType('increase');
      setTimeout(() => setRevenueChangeType(null), 1500);
    } else if (dailyRevenue < previousDailyRevenue) {
      setRevenueChangeType('decrease');
      setTimeout(() => setRevenueChangeType(null), 1500);
    }
    
    setPreviousDailyRevenue(dailyRevenue);
  }, [dailyRevenue]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        let nextIndex = (prev + 1) % sampleEvents.length;
        const nextEvent = sampleEvents[nextIndex];
        
        // If last event was failed and next event is also failed, skip to next
        if (lastEventWasFailed && nextEvent.details.toLowerCase().includes('failed')) {
          nextIndex = (nextIndex + 1) % sampleEvents.length;
        }
        
        return nextIndex;
      });

      setEvents((prev) => {
        const newEvent = sampleEvents[currentIndex];
        const isFailed = newEvent.details.toLowerCase().includes('failed');
        setLastEventWasFailed(isFailed);
        
        // Update daily revenue if this is a successful charge
        if (!isFailed && newEvent.type === 'charge' && newEvent.amount) {
          const amountInUSD = newEvent.currency && newEvent.currency !== 'USD' 
            ? newEvent.amount * (USD_CONVERSION_RATES[newEvent.currency] || 1) 
            : newEvent.amount;
          
          setDailyRevenue(prev => prev + amountInUSD);
        }
        
        if (isFailed) {
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
  }, [currentIndex, playSuccess, playFailure, playGeneric, isPaused, lastEventWasFailed]);

  // Filter events based on international toggle
  const filteredEvents = showInternationalOnly 
    ? events.filter(event => event.type === 'charge' && event.currency !== 'USD')
    : events;

  // Handle international toggle
  const handleInternationalToggle = () => {
    setShowInternationalOnly(!showInternationalOnly);
    
    // If toggling to international only and no international events exist
    if (!showInternationalOnly && filteredEvents.length === 0) {
      // Find first international event from sample data
      const internationalEvent = sampleEvents.find(event => 
        event.type === 'charge' && event.currency && event.currency !== 'USD'
      );
      
      if (internationalEvent) {
        setEvents([internationalEvent]);
        if (internationalEvent.details.toLowerCase().includes('failed')) {
          playFailure();
        } else if (internationalEvent.details.toLowerCase().includes('new customer')) {
          playGeneric();
        } else {
          playSuccess();
        }
      }
    }
  };

  // Function to adjust font size based on content width
  const adjustFontSize = () => {
    if (!amountRef.current) return;
    
    const containerWidth = amountRef.current.parentElement?.offsetWidth || 0;
    const contentWidth = amountRef.current.scrollWidth;
    
    // Define fixed size classes
    const sizes = [
      'text-7xl sm:text-[120px]',
      'text-6xl sm:text-[100px]',
      'text-5xl sm:text-[90px]',
      'text-4xl sm:text-[80px]'
    ];
    
    // Use a more conservative approach - if content is too large, immediately use a smaller size
    if (contentWidth > containerWidth * 0.9) {
      // If content is very large, use the smallest size
      if (contentWidth > containerWidth * 1.5) {
        setAmountFontSize(sizes[3]);
      } 
      // If content is moderately large, use the second smallest size
      else if (contentWidth > containerWidth * 1.2) {
        setAmountFontSize(sizes[2]);
      }
      // If content is slightly large, use the medium size
      else {
        setAmountFontSize(sizes[1]);
      }
    } 
    // If content fits well, use the largest size
    else {
      setAmountFontSize(sizes[0]);
    }
  };

  // Adjust font size when amount or currency changes, but with debounce
  useEffect(() => {
    // Use a timeout to debounce the adjustment
    const timeoutId = setTimeout(adjustFontSize, 50);
    
    // Add resize listener
    window.addEventListener('resize', adjustFontSize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', adjustFontSize);
    };
  }, [filteredEvents[0]?.amount, filteredEvents[0]?.currency]);

  return (
    <div 
      className="h-screen w-screen overflow-hidden bg-white transition-colors duration-500"
      style={{
        animation: isFlashing 
          ? 'splash 1s ease-out' 
          : 'none'
      }}
    >
      {/* International Toggle */}
      <button
        onClick={handleInternationalToggle}
        className={`fixed -ml-2 -mt-2 top-4 left-4 z-50 px-4 py-2 rounded-lg text-base font-semibold transition-all duration-200 ${
          showInternationalOnly 
            ? 'bg-blue-500 text-white hover:bg-blue-600' 
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        {showInternationalOnly ? '🌍 Int\'l Only' : '🌎 All Events'}
      </button>

      {/* Pause Button */}
      <button
        onClick={() => setIsPaused(!isPaused)}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors"
        aria-label={isPaused ? "Resume" : "Pause"}
      >
        {isPaused ? <FaPlay size={20} className="text-gray-600" /> : <FaPause size={20} className="text-gray-600" />}
      </button>

      <div className="h-full flex flex-col justify-center items-center px-5">
        <div className="w-full max-w-[580px]">
          <VolumeControl 
            volume={volume}
            onVolumeChange={setVolume}
            isMuted={isMuted}
            onMuteChange={setIsMuted}
            isSydneyMuted={isSydneyMuted}
            onSydneyMuteChange={setIsSydneyMuted}
          />

          <div className={`w-full h-[320px] sm:h-[420px] rounded-3xl border-4 relative overflow-hidden ${
            filteredEvents[0]?.details.toLowerCase().includes('failed') ? 'border-red-400' : 
            filteredEvents[0]?.details.toLowerCase().includes('new customer') ? 'border-blue-400' : 
            'border-green-400'
          }`}>
            {filteredEvents[0] && (
              <div
                className={`w-full h-full p-6 sm:p-8 transition-colors duration-500 ${
                  getEventColors(filteredEvents[0]).background
                } ${getEventColors(filteredEvents[0]).text}`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-xl sm:text-xl">{filteredEvents[0].details}</span>
                  {filteredEvents[0].amount ? (
                    <div className="flex flex-col">
                      <span 
                        ref={amountRef}
                        className={`font-semibold mt-4 sm:mt-6 transition-none ${amountFontSize}`}
                      >
                        {formatCurrency(filteredEvents[0].amount, filteredEvents[0].currency || 'USD')}
                      </span>
                      {filteredEvents[0].currency && filteredEvents[0].currency !== 'USD' && (
                        <span className={`text-gray-500 ${
                          formatCurrency(filteredEvents[0].amount * (USD_CONVERSION_RATES[filteredEvents[0].currency] || 1), 'USD').length > 15
                            ? 'text-lg sm:text-xl'
                            : 'text-xl sm:text-2xl'
                        }`}>
                          {formatCurrency(filteredEvents[0].amount * (USD_CONVERSION_RATES[filteredEvents[0].currency] || 1), 'USD')} USD
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-7xl sm:text-[120px] font-semibold mt-4 sm:mt-6">😃</span>
                  )}
                </div>

                {/* Date and time in bottom left */}
                <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 flex flex-col sm:flex-row gap-1 sm:gap-2 text-sm sm:text-base">
                                    <div>
                    {new Date(filteredEvents[0].timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </div>
                  •
                  <div>
                    {new Date(filteredEvents[0].timestamp).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>

                {/* Country flag in bottom right */}
                {(filteredEvents[0]?.country || filteredEvents[0]?.currency || filteredEvents[0]?.details.toLowerCase().includes('new customer')) && (
                  <div className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8">
                    <span className="text-6xl leading-[60px] block h-[60px]">
                      {filteredEvents[0].details.toLowerCase().includes('new customer')
                        ? '🇺🇸'
                        : filteredEvents[0].country 
                          ? getFlagEmoji(filteredEvents[0].country)
                          : filteredEvents[0].currency === 'USD' 
                            ? '🇺🇸'
                            : currencyToCountry[filteredEvents[0].currency as keyof typeof currencyToCountry]?.flag || '🌍'
                      }
                    </span>
                  </div>
                )}

                {filteredEvents[0].email && (
                  <div className="mt-4 sm:mt-5 text-base sm:text-lg">{filteredEvents[0].email}</div>
                )}
                {filteredEvents[0].plan && (
                  <div className="mt-4 sm:mt-5 text-base sm:text-lg">
                    Plan: {filteredEvents[0].plan} (Qty: {filteredEvents[0].quantity})
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Updated splash animation */}
        <style>{getSplashAnimation(filteredEvents[0])}</style>
      </div>
      
      {/* Powered by footer */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center items-center gap-2">
        <span className="text-xs text-gray-500">Powered by</span>
        <img 
          src={supersetLogo} 
          alt="Superset Logo" 
          className="h-3 w-auto"
        />
      </div>

      {/* Paused indicator */}
      {isPaused && (
        <div className="fixed top-6 left-0 right-0 text-gray-400 text-2xl font-normal text-center">
          Paused
        </div>
      )}

      {/* Daily Revenue Tally */}
      <div 
        className={`fixed bottom-6 left-6 font-normal transition-colors duration-300 ${
          revenueChangeType === 'increase' 
            ? 'text-green-700' 
            : revenueChangeType === 'decrease' 
              ? 'text-red-600' 
              : 'text-gray-400'
        }`}
      >
        <div className="text-sm">Revenue today</div>
        <div className="text-2xl">{formatCurrency(dailyRevenue, 'USD')}</div>
      </div>
    </div>
  );
}; 