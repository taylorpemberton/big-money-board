import React from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  isMuted: boolean;
  onMuteChange: (isMuted: boolean) => void;
  isSydneyMuted: boolean;
  onSydneyMuteChange: (isSydneyMuted: boolean) => void;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  onVolumeChange,
  isMuted,
  onMuteChange,
  isSydneyMuted,
  onSydneyMuteChange
}) => {
  // Common button style class
  const buttonClass = (isActive: boolean) => `w-8 h-8 flex items-center justify-center rounded-full ${
    isActive ? 'bg-blue-100' : 'bg-gray-200'
  }`;

  return (
    <div className="absolute bottom-4 right-4 flex flex-col items-center">
      {/* Mute buttons stacked vertically */}
      <div className="flex flex-col items-center gap-2 mb-2">
        <button
          onClick={() => onMuteChange(!isMuted)}
          className={buttonClass(!isMuted)}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <FaVolumeMute className="text-gray-500" />
          ) : (
            <FaVolumeUp className="text-blue-500" />
          )}
        </button>
        
        <button
          onClick={() => onSydneyMuteChange(!isSydneyMuted)}
          className={buttonClass(!isSydneyMuted)}
          aria-label={isSydneyMuted ? 'Unmute Sydney' : 'Mute Sydney'}
        >
          <span className={`font-medium text-md ${isSydneyMuted ? 'text-gray-500' : 'text-blue-500'}`}>
            🦑
          </span>
        </button>
      </div>
      
      {/* Vertical volume slider with labels */}
      <div className="flex flex-col items-center">
        <div className="text-xs text-gray-500">100%</div>
        <div className="h-24 flex items-center justify-center mx-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="h-24 w-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            style={{
              WebkitAppearance: 'slider-vertical',
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)'
            }}
          />
        </div>
        <div className="text-xs text-gray-500">0%</div>
      </div>
    </div>
  );
}; 