import React, { useState, useEffect } from 'react';
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

export const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(8);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
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

  const [playSuccess] = useSound('/sounds/success.mp3', { 
    volume: isMuted ? 0 : volume,
    interrupt: true 
  });
  const [playFailure] = useSound('/sounds/oh-brother.mp3', { 
    volume: isSydneyMuted ? 0 : volume,
    interrupt: true 
  });
  const [playGeneric] = useSound('/sounds/generic.mp3', { 
    volume: isMuted ? 0 : volume,
    interrupt: true 
  });

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

  useEffect(() => {
    if (isPaused) return;

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
  }, [currentIndex, playSuccess, playFailure, playGeneric, isPaused]);

  return (
    <div 
      className="h-screen w-screen overflow-hidden bg-white transition-colors duration-500"
      style={{
        animation: isFlashing 
          ? 'splash 1s ease-out' 
          : 'none'
      }}
    >
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
            events[0]?.details.toLowerCase().includes('failed') ? 'border-red-400' : 
            events[0]?.details.toLowerCase().includes('new customer') ? 'border-blue-400' : 
            'border-green-400'
          }`}>
            {events[0] && (
              <div
                className={`w-full h-full p-6 sm:p-8 transition-colors duration-500 ${
                  getEventColors(events[0]).background
                } ${getEventColors(events[0]).text}`}
              >
                {/* Date in top right */}
                <div className="absolute top-6 sm:top-8 right-6 sm:right-8 text-sm sm:text-base">
                  {new Date(events[0].timestamp).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                
                <div className="flex flex-col">
                  <span className="font-medium text-xl sm:text-xl">{events[0].details}</span>
                  {events[0].amount ? (
                    <span className="text-7xl sm:text-[120px] font-semibold mt-4 sm:mt-6">
                      {formatCurrency(events[0].amount, events[0].currency || 'USD')}
                    </span>
                  ) : (
                    <span className="text-7xl sm:text-[120px] font-semibold mt-4 sm:mt-6">😃</span>
                  )}
                </div>
                
                {/* Timestamp in bottom left */}
                <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 text-sm sm:text-base">
                  {new Date(events[0].timestamp).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </div>

                {/* Country flag in bottom right */}
                {events[0]?.country || (events[0]?.currency && currencyToCountry[events[0].currency as keyof typeof currencyToCountry]) && (
                  <div className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8">
                    <span className="text-6xl leading-[60px] block h-[60px]">
                      {events[0].country 
                        ? getFlagEmoji(events[0].country)
                        : currencyToCountry[events[0].currency as keyof typeof currencyToCountry].flag
                      }
                    </span>
                  </div>
                )}

                {events[0].email && (
                  <div className="mt-4 sm:mt-5 text-base sm:text-lg">{events[0].email}</div>
                )}
                {events[0].plan && (
                  <div className="mt-4 sm:mt-5 text-base sm:text-lg">
                    Plan: {events[0].plan} (Qty: {events[0].quantity})
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Updated splash animation */}
        <style>{getSplashAnimation(events[0])}</style>
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
    </div>
  );
}; 