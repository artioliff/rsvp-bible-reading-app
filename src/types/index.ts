export type AppScreen = 'home' | 'select' | 'reader';

export type Theme = 'dark' | 'light';

export interface ReadingPosition {
  book: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  wordIndex: number;
  timestamp: number;
}

export interface FavoriteVerse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  savedAt: number;
}

export interface ReadingHistoryEntry {
  id: string;
  book: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  startedAt: number;
  completedAt?: number;
  totalWords: number;
  wordsRead: number;
  speed: number;
}

export interface AppSettings {
  theme: Theme;
  spritzMode: boolean;
  speed: number;
  fontSize: number;
}

export interface WordEntry {
  word: string;
  verseRef: number;
}

export type Speed = 100 | 200 | 300 | 400 | 500 | 600 | 800 | 1000;

export const SPEED_OPTIONS: Speed[] = [100, 200, 300, 400, 500, 600, 800, 1000];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  spritzMode: false,
  speed: 300,
  fontSize: 48,
};
