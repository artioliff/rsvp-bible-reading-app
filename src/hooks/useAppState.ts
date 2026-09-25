import { useState, useCallback, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { DEFAULT_SETTINGS } from '../constants/settings';
import { bibleBooks, DEFAULT_TRANSLATION_CODE, loadTranslation } from '../data/bibleData';
import type { Book } from '../types/bible';
import {
  AppScreen,
  AppSettings,
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
  // Migração: settings antigos podem não ter o campo `translation` → default (ARA)
  const translation = settings.translation ?? DEFAULT_TRANSLATION_CODE;

  // Livros da tradução ativa — inicia com a amostra embutida (nunca vazio)
  const [books, setBooks] = useState<Book[]>(bibleBooks);
  const [isLoading, setIsLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  // Recarrega quando a tradução muda; guarda de corrida descarta respostas velhas
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    loadTranslation(translation).then((result) => {
      if (cancelled) return;
      setBooks(result.books);
      setIsFallback(result.isFallback);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [translation]);

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

  const setTranslation = useCallback(
    (code: string) => updateSettings({ translation: code }),
    [updateSettings]
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
    translation,
    setTranslation,
    books,
    isLoading,
    isFallback,
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
