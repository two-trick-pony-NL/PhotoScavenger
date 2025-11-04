// hooks/useBackgroundMusic.ts
import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

export function useBackgroundMusic(source: any) {
  const musicRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const loadMusic = async () => {
      const music = new Audio.Sound();
      try {
        await music.loadAsync(source);
        await music.setIsLoopingAsync(true);
        await music.setVolumeAsync(0.5); // 50% volume
        await music.playAsync();
        musicRef.current = music;
      } catch (err) {
        console.warn('Failed to play background music', err);
      }
    };

    loadMusic();

    return () => {
      if (musicRef.current) musicRef.current.unloadAsync();
    };
  }, [source]);

  const stopMusic = async () => {
    if (musicRef.current) await musicRef.current.stopAsync();
  };

  const pauseMusic = async () => {
    if (musicRef.current) await musicRef.current.pauseAsync();
  };

  const resumeMusic = async () => {
    if (musicRef.current) await musicRef.current.playAsync();
  };

  return { stopMusic, pauseMusic, resumeMusic };
}
