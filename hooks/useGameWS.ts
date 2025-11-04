import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/GameStore';

export function useGameWS(wsUrl: string) {
  const wsRef = useRef<WebSocket | null>(null);

  const setStatus = useGameStore((state) => state.setStatus);
  const setTimeRemaining = useGameStore((state) => state.setTimeRemaining);
  const setLeaderboard = useGameStore((state) => state.setLeaderboard);
  const setRoundEmojis = useGameStore((state) => state.setRoundEmojis);
  const setEmojiState = useGameStore((state) => state.setEmojiState);
  const addEvent = useGameStore((state) => state.addEvent);

  // Helper to pick random item from an array
  const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = (msg) => console.log('WS connected');

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);

        switch (data.type) {
          case 'full_state':
            setLeaderboard(data.leaderboard);
            setStatus(data.status);
            setRoundEmojis(data.emojis || []);
            break;

          case 'countdown':
            setTimeRemaining(data.time_remaining);
            setStatus(data.status);
            break;

          case 'new_round':
            setRoundEmojis(data.emojis);
            break;

          case 'photo_uploading': {
            setEmojiState(data.emoji, 'uploading');

            const uploadMessages = [
              `${data.player_id} is frantically snapping ${data.emoji}! 📸`,
              `${data.player_id} is on a roll with ${data.emoji}! ⚡`,
              `${data.player_id} just spotted ${data.emoji} and is taking a shot!`,
              `Look out! ${data.player_id} is chasing ${data.emoji}!`,
              `${data.player_id} is racing against the clock for ${data.emoji}!`,
              `${data.player_id} is capturing ${data.emoji} like a pro!`,
              `${data.player_id} has their eyes on ${data.emoji}! 👀`,
              `${data.player_id} snaps a photo of ${data.emoji}!`,
              `Hurry! ${data.player_id} is after ${data.emoji}!`,
              `${data.player_id} is going all-in on ${data.emoji}! 🔥`,
            ];

            addEvent({ type: 'uploading', msg: pickRandom(uploadMessages) });
            break;
          }

          case 'emoji_locked': {
            setEmojiState(data.emoji, 'locked');
            setLeaderboard(data.leaderboard);

            const lockedMessages = [
              `🎉 ${data.winner} captured ${data.emoji} and scored +${data.points} points!`,
              `${data.winner} locked in ${data.emoji}! Well done! 🏆`,
              `Boom! ${data.winner} found ${data.emoji} (+${data.points})!`,
              `${data.winner} nailed it! ${data.emoji} is theirs! 🎯`,
              `Victory! ${data.winner} grabbed ${data.emoji} for +${data.points} points!`,
              `${data.winner} swooped in and claimed ${data.emoji}! ✨`,
              `${data.winner} got ${data.emoji}! Crowd goes wild! 🎊`,
              `Yes! ${data.winner} discovered ${data.emoji} and scored big!`,
              `${data.winner} is unstoppable! ${data.emoji} +${data.points} points!`,
              `${data.winner} triumphantly locked ${data.emoji}! 🏅`,
            ];

            addEvent({ type: 'locked', msg: pickRandom(lockedMessages) });
            break;
          }

          case 'round_ended':
            setStatus('ended');
            setLeaderboard(data.leaderboard);
            useGameStore.getState().resetRound();
            break;
        }
      } catch (err) {
        console.error('WS parse error', err);
      }
    };

    ws.onclose = () => console.log('WS disconnected');

    return () => ws.close();
  }, [wsUrl]);
}
