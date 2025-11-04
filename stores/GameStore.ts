import { create } from 'zustand';

export type PlayerScore = { name: string; points: number };
export type EmojiState = 'idle' | 'uploading' | 'locked' | 'wrong';
export type GameEvent = { type: string; msg: string; [key: string]: any };

type GameState = {
  status: 'idle' | 'pre_round' | 'running' | 'ended';
  timeRemaining: number;
  roundEmojis: string[];
  leaderboard: PlayerScore[];
  emojiStates: Record<string, EmojiState>;
  events: GameEvent[];

  setStatus: (status: GameState['status']) => void;
  setTimeRemaining: (time: number) => void;
  setRoundEmojis: (emojis: string[]) => void;
  addEvent: (event: GameEvent) => void;
  setEmojiState: (emoji: string, state: EmojiState) => void;
  setLeaderboard: (lb: PlayerScore[]) => void;
  resetRound: () => void;
};

export const useGameStore = create<GameState>((set) => ({
  status: 'idle',
  timeRemaining: 0,
  roundEmojis: [],
  leaderboard: [],
  emojiStates: {},
  events: [],

  setStatus: (status) => set({ status }),
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  setRoundEmojis: (roundEmojis) => set({ roundEmojis }),
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 10),
    })),
  setEmojiState: (emoji, emojiState) =>
    set((state) => ({
      emojiStates: { ...state.emojiStates, [emoji]: emojiState },
    })),
  setLeaderboard: (lb) => set({ leaderboard: lb }),
  resetRound: () =>
    set({
      events: [],
      roundEmojis: [],
      emojiStates: {},
      status: 'pre_round',
      timeRemaining: 10,
    }),
}));
