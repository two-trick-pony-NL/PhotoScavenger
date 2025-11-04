// hooks/useSounds.ts
import { Audio } from 'expo-av';
import { useRef } from 'react';

export function useSound() {
  const soundRef = useRef<Audio.Sound | null>(null);

  const playSound = async (file: number, loop: boolean = false) => {
    try {
      // unload previous sound if one is playing
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(file, {
        shouldPlay: true,
        isLooping: loop,
      });

      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing sound', error);
    }
  };

  const stopSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping sound', error);
    }
  };

  return { playSound, stopSound };
}
