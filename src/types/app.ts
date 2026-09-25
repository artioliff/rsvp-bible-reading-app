// Tipos de estado/interação da aplicação

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
  /** Código da tradução ativa (ex.: 'ARA') — ver TRANSLATIONS em data/bibleData */
  translation: string;
}

export interface WordEntry {
  word: string;
  verseRef: number;
}

export type Speed = 100 | 200 | 300 | 400 | 500 | 600 | 800 | 1000;
