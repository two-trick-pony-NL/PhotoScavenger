// hooks/useSounds.ts
import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

type SoundName = 'countdown' | 'success' | 'fail' | 'leaderboard';

const SOUND_FILES: Record<SoundName, any> = {
  countdown: require('@/assets/sounds/countdown-beep.mp3'),
  success: require('@/assets/sounds/success.mp3'),
  fail: require('@/assets/sounds/fail.mp3'),
  leaderboard: require('@/assets/sounds/leaderboard.mp3'),
};

export function useSound() {
  const sounds = useRef<Record<SoundName, Audio.Sound | null>>({} as any);

  useEffect(() => {
    (async () => {
      for (const [key, file] of Object.entries(SOUND_FILES)) {
        const sound = new Audio.Sound();
        try {
          await sound.loadAsync(file);
          sounds.current[key as SoundName] = sound;
        } catch (err) {
          console.warn(`Failed to load sound ${key}`, err);
        }
      }
    })();

    return () => {
      Object.values(sounds.current).forEach((s) => s?.unloadAsync());
    };
  }, []);

  const playSound = async (name: SoundName) => {
    const sound = sounds.current[name];
    if (!sound) return;
    try {
      await sound.replayAsync(); // one-shot play
    } catch (err) {
      console.warn(`Failed to play sound ${name}`, err);
    }
  };

  return { playSound };
}
