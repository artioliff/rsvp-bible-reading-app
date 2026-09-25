import { useState, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import {
  AppScreen,
  AppSettings,
  DEFAULT_SETTINGS,
  FavoriteVerse,
  ReadingHistoryEntry,
  ReadingPosition,
} from '../types';

export interface SelectionState {
  book: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
}

function useAppState() {
  const [screen, setScreen] = useState<AppScreen>('home');
  const [settings, setSettings] = useLocalStorage<AppSettings>('lbr_settings', DEFAULT_SETTINGS);
  const [lastPosition, setLastPosition] = useLocalStorage<ReadingPosition | null>(
    'lbr_last_position',
    null
  );
  const [favorites, setFavorites] = useLocalStorage<FavoriteVerse[]>('lbr_favorites', []);
  const [history, setHistory] = useLocalStorage<ReadingHistoryEntry[]>('lbr_history', []);
  const [selection, setSelection] = useState<SelectionState>({
    book: 'João',
    chapter: 3,
    startVerse: 1,
    endVerse: 21,
  });

  const navigate = useCallback((s: AppScreen) => setScreen(s), []);

  const updateSettings = useCallback(
    (partial: Partial<AppSettings>) => {
      setSettings((prev) => ({ ...prev, ...partial }));
    },
    [setSettings]
  );

  const savePosition = useCallback(
    (pos: ReadingPosition) => {
      setLastPosition(pos);
    },
    [setLastPosition]
  );

  const addFavorite = useCallback(
    (fav: FavoriteVerse) => {
      setFavorites((prev) => {
        const exists = prev.find((f) => f.id === fav.id);
        if (exists) return prev;
        return [fav, ...prev];
      });
    },
    [setFavorites]
  );

  const removeFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    },
    [setFavorites]
  );

  const isFavorite = useCallback(
    (book: string, chapter: number, verse: number) => {
      return favorites.some(
        (f) => f.book === book && f.chapter === chapter && f.verse === verse
      );
    },
    [favorites]
  );

  const addHistory = useCallback(
    (entry: ReadingHistoryEntry) => {
      setHistory((prev) => {
        const existing = prev.findIndex((h) => h.id === entry.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = entry;
          return updated;
        }
        return [entry, ...prev].slice(0, 50); // keep last 50
      });
    },
    [setHistory]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  return {
    screen,
    navigate,
    settings,
    updateSettings,
    lastPosition,
    savePosition,
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    history,
    addHistory,
    clearHistory,
    selection,
    setSelection,
  };
}

export default useAppState;
