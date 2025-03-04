import React, { useState, useRef, useEffect } from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  isMuted: boolean;
  onMuteChange: (isMuted: boolean) => void;
  isSydneyMuted: boolean;
  onSydneyMuteChange: (isMuted: boolean) => void;
}

export const VolumeControl = ({ 
  volume, 
  onVolumeChange, 
  isMuted, 
  onMuteChange,
  isSydneyMuted,
  onSydneyMuteChange
}: VolumeControlProps) => {
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleMuteToggle = () => {
    if (isMuted) {
      onVolumeChange(previousVolume);
    } else {
      setPreviousVolume(volume);
      onVolumeChange(0);
    }
    onMuteChange(!isMuted);
  };

  const handleSydneyMuteToggle = () => {
    onSydneyMuteChange(!isSydneyMuted);
  };

  const handleDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const rect = sliderRef.current.getBoundingClientRect();
    const height = rect.height;
    const top = rect.top;
    
    // Calculate position relative to the slider
    let position = clientY - top;
    // Invert the position (0 is bottom, height is top)
    position = height - position;
    // Convert to volume (0 to 1)
    let newVolume = position / height;
    // Clamp between 0 and 1
    newVolume = Math.max(0, Math.min(1, newVolume));
    
    onVolumeChange(newVolume);
    if (newVolume > 0) {
      onMuteChange(false);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('touchmove', handleDrag);
      window.addEventListener('mouseup', () => setIsDragging(false));
      window.addEventListener('touchend', () => setIsDragging(false));
    }

    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('mouseup', () => setIsDragging(false));
      window.removeEventListener('touchend', () => setIsDragging(false));
    };
  }, [isDragging, volume]);

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 p-2 rounded-lg bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col gap-2">
        <button
          onClick={handleMuteToggle}
          className="text-gray-500 hover:text-gray-400 transition-colors"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <FaVolumeMute size={20} className="sm:w-6 sm:h-6" /> : <FaVolumeUp size={20} className="sm:w-6 sm:h-6" />}
        </button>
        <button
          onClick={handleSydneyMuteToggle}
          className={`text-sm font-medium transition-colors ${isSydneyMuted ? 'text-red-500 line-through' : 'text-gray-500 hover:text-gray-400'}`}
          aria-label={isSydneyMuted ? "Unmute Sydney" : "Mute Sydney"}
        >
          Syd
        </button>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[10px] sm:text-xs text-gray-400 mb-1">100%</span>
        <div 
          ref={sliderRef}
          className="h-16 sm:h-24 w-8 sm:w-10 relative cursor-pointer"
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
        >
          {/* Background track */}
          <div className="absolute left-1/2 w-[2px] sm:w-[3px] h-full bg-gray-200 rounded-full -translate-x-1/2" />
          
          {/* Filled track */}
          <div 
            className="absolute left-1/2 w-[2px] sm:w-[3px] bg-blue-500 rounded-full -translate-x-1/2 transition-all duration-75"
            style={{
              height: `${(isMuted ? 0 : volume) * 100}%`,
              bottom: 0
            }}
          />
          
          {/* Handle */}
          <div 
            className="absolute left-1/2 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full -translate-x-1/2 transition-transform hover:bg-blue-600 active:bg-blue-700"
            style={{
              bottom: `${(isMuted ? 0 : volume) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          />
          
          {/* Invisible range input for accessibility */}
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume * 100}
            onChange={(e) => {
              const newVolume = parseInt(e.target.value) / 100;
              onVolumeChange(newVolume);
              if (newVolume > 0) {
                onMuteChange(false);
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <span className="text-[10px] sm:text-xs text-gray-400 mt-1">0%</span>
      </div>
    </div>
  );
}; 