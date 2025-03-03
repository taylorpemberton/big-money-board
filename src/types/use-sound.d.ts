declare module 'use-sound' {
  type UseSoundHook = (
    src: string,
    options?: {
      volume?: number;
      playbackRate?: number;
      interrupt?: boolean;
      soundEnabled?: boolean;
      sprite?: Record<string, [number, number]>;
      onplay?: () => void;
      onend?: () => void;
      onpause?: () => void;
    }
  ) => [() => void, { stop: () => void; pause: () => void; duration: number | null }];

  const useSound: UseSoundHook;
  export default useSound;
} 