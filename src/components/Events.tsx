import React, { useState, useEffect, useRef } from 'react';
import { sampleEvents } from '../data/sampleData';
import '../tailwind.css';
import useSound from 'use-sound';
import { VolumeControl } from './VolumeControl';
import { Event } from '../types/Event';
import supersetLogo from '../assets/superset-logo.svg';
import { FaPause, FaPlay, FaVolumeUp } from 'react-icons/fa';
import { getEventColors } from '../utils/eventStyles';
import { formatCurrency } from '../utils/formatting';
import { currencyToCountry, getFlagEmoji } from '../utils/flags';
import { getSplashAnimation } from '../utils/animations';
import { fetchEvents } from '../api/stripeApi';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [audioContextInitialized, setAudioContextInitialized] = useState(false);
  
  const [playSuccess] = useSound('/sounds/success.mp3', { 
    volume: isMuted ? 0 : volume,
    interrupt: true
  });
  const [playFailure] = useSound('/sounds/oh-brother.mp3', { 
    volume: isSydneyMuted ? 0 : volume,
    interrupt: true
  });
  const [playGeneric] = useSound('/sounds/success.mp3', { 
    volume: isMuted ? 0 : volume,
    interrupt: true
  });

  const amountRef = useRef<HTMLSpanElement>(null);
  const [amountFontSize, setAmountFontSize] = useState('text-7xl sm:text-[120px]');

  // Add a direct sound playing function as a fallback
  const playSound = (type: 'success' | 'failure' | 'generic') => {
    console.log(`Attempting to play ${type} sound directly`);
    try {
      const audio = new Audio(`/sounds/${type === 'success' ? 'success.mp3' : type === 'failure' ? 'oh-brother.mp3' : 'success.mp3'}`);
      audio.volume = type === 'failure' ? (isSydneyMuted ? 0 : volume) : (isMuted ? 0 : volume);
      audio.play().catch(e => console.error('Error playing sound:', e));
    } catch (e) {
      console.error('Error creating Audio object:', e);
    }
  };

  // Handle international toggle
  const handleInternationalToggle = () => {
    setShowInternationalOnly(!showInternationalOnly);
  };

  // Filter events based on international toggle
  const filteredEvents = showInternationalOnly 
    ? events.filter(event => event.type === 'charge' && event.currency !== 'USD')
    : events;

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

  // Load real events from Stripe
  useEffect(() => {
    // Function to load real events
    const loadRealEvents = async () => {
      try {
        setIsLoading(true);
        const realEvents = await fetchEvents();
        
        if (realEvents && realEvents.length > 0) {
          // Get the latest event for sound playing
          const latestEvent = realEvents[0];
          
          // Check if we have new events by comparing with current events
          const isNewEvent = events.length === 0 || 
            realEvents[0].timestamp !== events[0]?.timestamp ||
            realEvents[0].details !== events[0]?.details;
          
          // Always play sound for the latest event if it's new
          if (isNewEvent) {
            // Play sound based on event type - do this before updating state
            if (latestEvent.details.toLowerCase().includes('failed')) {
              console.log('Playing failure sound for event:', latestEvent.details);
              setLastEventWasFailed(true);
              playFailure();
              // Also try direct sound playing as fallback
              playSound('failure');
            } else if (latestEvent.details.toLowerCase().includes('new customer')) {
              console.log('Playing generic sound for event:', latestEvent.details);
              setLastEventWasFailed(false);
              playGeneric();
              // Also try direct sound playing as fallback
              playSound('generic');
            } else {
              console.log('Playing success sound for event:', latestEvent.details);
              setLastEventWasFailed(false);
              playSuccess();
              // Also try direct sound playing as fallback
              playSound('success');
            }
            
            // Update the UI with new events
            setEvents(realEvents);
            
            // Update daily revenue if this is a successful charge
            if (latestEvent.type === 'charge' && latestEvent.status === 'succeeded' && latestEvent.amount) {
              const amountInUSD = latestEvent.currency && latestEvent.currency !== 'USD' 
                ? latestEvent.amount * (USD_CONVERSION_RATES[latestEvent.currency] || 1) 
                : latestEvent.amount;
              
              setDailyRevenue(prev => prev + amountInUSD);
            }
            
            // Flash effect for new events
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 1000);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to load events:', err);
        setError('Failed to load events from Stripe');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Load events immediately
    loadRealEvents();
    
    // Set up a very infrequent polling as a fallback (every 60 seconds)
    // This is just to ensure we don't miss events if the server doesn't notify us
    const intervalId = setInterval(() => {
      if (!isPaused) {
        loadRealEvents();
      }
    }, 60000); // 60 seconds instead of 30 seconds
    
    // Set up event source for server-sent events (if supported by the browser)
    const checkForNewEvents = () => {
      // Only check if not paused
      if (!isPaused) {
        // Add a timestamp to prevent caching
        const timestamp = new Date().getTime();
        fetch(`${window.location.origin}/api/events/check-new?lastTimestamp=${events[0]?.timestamp || ''}&_=${timestamp}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error ${response.status}`);
            }
            return response.text();
          })
          .then(text => {
            // Check if the response is HTML instead of JSON
            if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
              console.warn('Received HTML instead of JSON, skipping this check');
              return { hasNewEvents: false };
            }
            
            try {
              return JSON.parse(text);
            } catch (e) {
              console.warn('Failed to parse JSON response:', text);
              return { hasNewEvents: false };
            }
          })
          .then(data => {
            if (data.hasNewEvents) {
              loadRealEvents();
            }
          })
          .catch(err => {
            console.error('Error checking for new events:', err);
          });
      }
    };
    
    // Check for new events every 15 seconds (increased from 5 seconds)
    const checkIntervalId = setInterval(checkForNewEvents, 15000);
    
    return () => {
      clearInterval(intervalId);
      clearInterval(checkIntervalId);
    };
  }, [playSuccess, playFailure, playGeneric, isPaused, events]);

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

  // Auto-initialize audio context on component mount
  useEffect(() => {
    // Try to initialize audio context automatically
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      try {
        // Create a new audio context
        const audioCtx = new AudioContext();
        
        // Play a silent sound to unlock audio on iOS/Safari
        const silentBuffer = audioCtx.createBuffer(1, 1, 22050);
        const source = audioCtx.createBufferSource();
        source.buffer = silentBuffer;
        source.connect(audioCtx.destination);
        source.start();
        
        // Also try to play each sound once with volume 0 to initialize them
        const initSounds = async () => {
          try {
            // Create and play silent versions of all sounds
            const sounds = [
              new Audio('/sounds/success.mp3'),
              new Audio('/sounds/oh-brother.mp3')
            ];
            
            // Set volume to 0 and play each sound
            sounds.forEach(sound => {
              sound.volume = 0;
              sound.play().catch(e => console.error('Error pre-loading sound:', e));
            });
            
            // Set state to indicate audio is initialized
            setAudioContextInitialized(true);
            console.log('Audio context and sounds initialized automatically');
          } catch (err) {
            console.error('Error initializing sounds:', err);
          }
        };
        
        initSounds();
      } catch (err) {
        console.error('Failed to auto-initialize audio context:', err);
      }
    }
  }, []);

  // Enhanced event handling to ensure sounds play for all events
  useEffect(() => {
    if (events.length > 0 && !isPaused) {
      // Get the most recent event
      const latestEvent = events[0];
      
      // Determine which sound to play based on the event type
      if (latestEvent.details.toLowerCase().includes('failed')) {
        // Play failure sound for failed events
        playFailure();
        console.log('Playing failure sound for event:', latestEvent.details);
      } else if (latestEvent.details.toLowerCase().includes('new customer')) {
        // Play success sound for new customers
        playSuccess();
        console.log('Playing success sound for event:', latestEvent.details);
      } else {
        // Play generic sound for all other events
        playGeneric();
        console.log('Playing generic sound for event:', latestEvent.details);
      }
    }
  }, [events.length, isPaused]); // Only re-run when events length changes or pause state changes

  // Add loading and error states to your UI
  if (isLoading && events.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events from Stripe...</p>
        </div>
      </div>
    );
  }
  
  if (error && events.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-800 text-xl mb-2">Error Loading Data</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Also add a check for empty events array
  if (events.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-yellow-500 text-5xl mb-4">⏳</div>
          <p className="text-gray-800 text-xl mb-2">Waiting for Stripe Events</p>
          <p className="text-gray-600 mb-4">No events have been received yet. Send a test webhook from the Stripe Dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white ${isFlashing ? 'animate-flash' : ''}`}>
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

      {/* Center the main content vertically and horizontally */}
      <div className="h-screen flex flex-col justify-center items-center px-5">
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
    </div>
  );
}; 