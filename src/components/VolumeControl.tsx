import { useState } from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  isMuted: boolean;
  onMuteChange: (isMuted: boolean) => void;
}

export const VolumeControl = ({ volume, onVolumeChange, isMuted, onMuteChange }: VolumeControlProps) => {
  const [previousVolume, setPreviousVolume] = useState(volume);

  const handleMuteToggle = () => {
    if (isMuted) {
      onVolumeChange(previousVolume);
    } else {
      setPreviousVolume(volume);
      onVolumeChange(0);
    }
    onMuteChange(!isMuted);
  };

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 p-2 rounded-lg">
      <button
        onClick={handleMuteToggle}
        className="text-gray-500 hover:text-gray-400 transition-colors"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <FaVolumeMute size={24} /> : <FaVolumeUp size={24} />}
      </button>
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-400 mb-1">100%</span>
        <div className="h-24 w-[3px] bg-gray-700 rounded-full relative">
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume * 100}
            onChange={(e) => {
              const newVolume = parseInt(e.target.value) / 100;
              onVolumeChange(newVolume);
              onMuteChange(false);
            }}
            className="absolute -rotate-90 origin-left left-1/2 -translate-x-1/2 bottom-0 w-24 h-[3px] appearance-none bg-transparent"
          />
        </div>
        <span className="text-xs text-gray-400 mt-1">0%</span>
      </div>
    </div>
  );
}; 