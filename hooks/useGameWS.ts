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


  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => console.log('WS connected');

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

          case 'photo_uploading':
            setEmojiState(data.emoji, 'uploading');
            addEvent({ type: 'uploading', msg: `${data.player_id} is uploading ${data.emoji}` });
            break;

          case 'emoji_locked':
            setEmojiState(data.emoji, 'locked');
            setLeaderboard(data.leaderboard);
            addEvent({ type: 'locked', msg: `${data.winner} locked ${data.emoji} (+${data.points})` });
            
            break;

          case 'round_ended':
            setStatus('ended');
            setLeaderboard(data.leaderboard);
            useGameStore.getState().resetRound(); // wipes events & status
            addEvent({ type: 'round_ended', msg: 'Round ended!' });
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
