import { create } from 'zustand';

export type PlayerScore = { name: string; points: number };
export type EmojiState = 'idle' | 'uploading' | 'locked' | 'wrong';
export type GameEvent = { type: string; msg: string; [key: string]: any };

type RoundStats = {
  photosTaken: number;
  correctPhotos: number;
  roundsPlayed: number;
};

type GameState = {
  status: 'idle' | 'pre_round' | 'running' | 'ended';
  timeRemaining: number;
  roundEmojis: string[];
  leaderboard: PlayerScore[];
  emojiStates: Record<string, EmojiState>;
  events: GameEvent[];
  roundStats: RoundStats;

  setStatus: (status: GameState['status']) => void;
  setTimeRemaining: (time: number) => void;
  setRoundEmojis: (emojis: string[]) => void;
  addEvent: (event: GameEvent) => void;
  setEmojiState: (emoji: string, state: EmojiState) => void;
  setLeaderboard: (lb: PlayerScore[]) => void;
  resetRound: () => void;
  resetRoundStats: () => void; // ✅ add this


  incrementPhotosTaken: () => void;
  incrementCorrectPhotos: () => void;
  incrementRoundsPlayed: () => void;
};

export const useGameStore = create<GameState>((set) => ({
  status: 'idle',
  timeRemaining: 0,
  roundEmojis: [],
  leaderboard: [],
  emojiStates: {},
  events: [],
  roundStats: {
    photosTaken: 0,
    correctPhotos: 0,
    roundsPlayed: 0,
  },

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
  set((state) => ({
    events: [],
    roundEmojis: [],
    emojiStates: {},
    status: 'pre_round',
    timeRemaining: 10,
    // Remove roundStats changes here
  })),

  resetRoundStats: () =>
    set((state) => ({
      roundStats: {
        photosTaken: 0,
        correctPhotos: 0,
        roundsPlayed: state.roundStats.roundsPlayed, // do NOT increment here
      },
    })),


  incrementPhotosTaken: () =>
    set((state) => ({
      roundStats: { ...state.roundStats, photosTaken: state.roundStats.photosTaken + 1 },
    })),
  incrementCorrectPhotos: () =>
    set((state) => ({
      roundStats: { ...state.roundStats, correctPhotos: state.roundStats.correctPhotos + 1 },
    })),
  incrementRoundsPlayed: () =>
    set((state) => ({
      roundStats: { ...state.roundStats, roundsPlayed: state.roundStats.roundsPlayed + 1 },
    })),
}));
