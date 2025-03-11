import React from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  isMuted: boolean;
  onMuteChange: (isMuted: boolean) => void;
  isSydneyMuted?: boolean;
  onSydneyMuteChange?: (isSydneyMuted: boolean) => void;
}

export function VolumeControl({
  volume,
  onVolumeChange,
  isMuted,
  onMuteChange,
  isSydneyMuted = false,
  onSydneyMuteChange
}: VolumeControlProps) {
  return (
    <div className="flex flex-col items-center bg-white rounded-xl pb-3 border-gray-100" style={{ zIndex: 9999, position: 'relative' }}>
      <div className="flex flex-col items-center gap-2 mb-3">
        <button 
          onClick={() => onMuteChange(!isMuted)}
          className={`flex items-center justify-center w-7 h-7 rounded-full ${
            isMuted ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-500'
          }`}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <FaVolumeMute className="h-4 w-4" />
          ) : (
            <FaVolumeUp className="h-4 w-4" />
          )}
        </button>
        
        {onSydneyMuteChange && (
          <button
            onClick={() => onSydneyMuteChange(!isSydneyMuted)}
            className={`flex items-center justify-center w-7 h-7 rounded-full ${
              isSydneyMuted ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-500'
            }`}
            aria-label={isSydneyMuted ? 'Unmute Sydney' : 'Mute Sydney'}
          >
            <span className="text-lg">🦑</span>
          </button>
        )}
      </div>
      
      <div className="h-24 flex items-center justify-center">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="h-24 w-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            WebkitAppearance: 'slider-vertical',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)'
          }}
        />
      </div>
    </div>
  );
} 