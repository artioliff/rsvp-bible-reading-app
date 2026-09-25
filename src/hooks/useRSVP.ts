import { useState, useEffect, useRef, useCallback } from 'react';
import { WordEntry } from '../types';

interface UseRSVPOptions {
  words: WordEntry[];
  speed: number; // words per minute
  initialIndex?: number;
  onWordChange?: (index: number, word: WordEntry) => void;
  onComplete?: () => void;
}

interface UseRSVPReturn {
  currentIndex: number;
  currentWord: WordEntry | null;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  restart: () => void;
  skipForward: (n?: number) => void;
  skipBackward: (n?: number) => void;
  seekTo: (index: number) => void;
  progress: number; // 0-100
  estimatedTimeLeft: number; // seconds
}

function useRSVP({
  words,
  speed,
  initialIndex = 0,
  onWordChange,
  onComplete,
}: UseRSVPOptions): UseRSVPReturn {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wordsRef = useRef(words);
  const speedRef = useRef(speed);
  const onWordChangeRef = useRef(onWordChange);
  const onCompleteRef = useRef(onComplete);

  wordsRef.current = words;
  speedRef.current = speed;
  onWordChangeRef.current = onWordChange;
  onCompleteRef.current = onComplete;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    const interval = Math.floor(60000 / speedRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= wordsRef.current.length) {
          clearTimer();
          setIsPlaying(false);
          onCompleteRef.current?.();
          return prev;
        }
        onWordChangeRef.current?.(next, wordsRef.current[next]);
        return next;
      });
    }, interval);
  }, [clearTimer]);

  const play = useCallback(() => {
    if (currentIndex >= words.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  }, [currentIndex, words.length]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    clearTimer();
  }, [clearTimer]);

  const restart = useCallback(() => {
    clearTimer();
    setCurrentIndex(0);
    setIsPlaying(false);
  }, [clearTimer]);

  const skipForward = useCallback(
    (n = 10) => {
      setCurrentIndex((prev) => Math.min(prev + n, words.length - 1));
    },
    [words.length]
  );

  const skipBackward = useCallback(
    (n = 10) => {
      setCurrentIndex((prev) => Math.max(prev - n, 0));
    },
    []
  );

  const seekTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, index));
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startTimer();
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [isPlaying, startTimer, clearTimer]);

  // Restart timer when speed changes while playing
  useEffect(() => {
    if (isPlaying) {
      startTimer();
    }
  }, [speed]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentWord = words[currentIndex] ?? null;
  const progress = words.length > 0 ? (currentIndex / (words.length - 1)) * 100 : 0;
  const wordsLeft = words.length - currentIndex;
  const estimatedTimeLeft = wordsLeft > 0 ? Math.ceil((wordsLeft / speed) * 60) : 0;

  return {
    currentIndex,
    currentWord,
    isPlaying,
    play,
    pause,
    restart,
    skipForward,
    skipBackward,
    seekTo,
    progress,
    estimatedTimeLeft,
  };
}

export default useRSVP;
