import { useEffect, useRef, useState, useCallback } from 'react';
import { AppScreen, AppSettings, FavoriteVerse, ReadingHistoryEntry, ReadingPosition, WordEntry } from '../types';
import { getAllWords, getVerses } from '../data/bibleData';
import { SelectionState } from '../hooks/useAppState';
import useRSVP from '../hooks/useRSVP';
import SpritzWord from './SpritzWord';
import SpeedControl from './SpeedControl';
import FavoritesPanel from './FavoritesPanel';
import HistoryPanel from './HistoryPanel';
import {
  ArrowLeft,
  Heart,
  BookMarked,
  Settings,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sun,
  Moon,
  Zap,
  ZapOff,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface ReaderScreenProps {
  onNavigate: (screen: AppScreen) => void;
  selection: SelectionState;
  settings: AppSettings;
  onSettingsChange: (partial: Partial<AppSettings>) => void;
  lastPosition: ReadingPosition | null;
  onSavePosition: (pos: ReadingPosition) => void;
  favorites: FavoriteVerse[];
  onAddFavorite: (fav: FavoriteVerse) => void;
  onRemoveFavorite: (id: string) => void;
  isFavorite: (book: string, chapter: number, verse: number) => boolean;
  history: ReadingHistoryEntry[];
  onAddHistory: (entry: ReadingHistoryEntry) => void;
  onClearHistory: () => void;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

const ReaderScreen: React.FC<ReaderScreenProps> = ({
  onNavigate,
  selection,
  settings,
  onSettingsChange,
  lastPosition,
  onSavePosition,
  favorites,
  onAddFavorite,
  onRemoveFavorite,
  isFavorite,
  history,
  onAddHistory,
  onClearHistory,
}) => {
  const isDark = settings.theme === 'dark';

  // Build word list
  const verses = getVerses(
    selection.book,
    selection.chapter,
    selection.startVerse,
    selection.endVerse
  );
  const words: WordEntry[] = getAllWords(verses);

  // Determine initial index (from saved position if matching)
  const getInitialIndex = (): number => {
    if (
      lastPosition &&
      lastPosition.book === selection.book &&
      lastPosition.chapter === selection.chapter &&
      lastPosition.startVerse === selection.startVerse &&
      lastPosition.endVerse === selection.endVerse
    ) {
      return Math.min(lastPosition.wordIndex, words.length - 1);
    }
    return 0;
  };

  const [showControls, setShowControls] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [wordAnimation, setWordAnimation] = useState(true);
  const [justFavorited, setJustFavorited] = useState(false);
  const [completed, setCompleted] = useState(false);
  const sessionId = useRef(`session_${Date.now()}`);
  const sessionStart = useRef(Date.now());
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleComplete = useCallback(() => {
    setCompleted(true);
  }, []);

  const rsvp = useRSVP({
    words,
    speed: settings.speed,
    initialIndex: getInitialIndex(),
    onComplete: handleComplete,
  });

  // Auto-hide controls while playing
  useEffect(() => {
    if (rsvp.isPlaying) {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    } else {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
      setShowControls(true);
    }
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [rsvp.isPlaying]);

  // Word flash animation
  useEffect(() => {
    setWordAnimation(false);
    const t = setTimeout(() => setWordAnimation(true), 30);
    return () => clearTimeout(t);
  }, [rsvp.currentIndex]);

  // Save position periodically
  useEffect(() => {
    if (rsvp.currentIndex > 0) {
      onSavePosition({
        book: selection.book,
        chapter: selection.chapter,
        startVerse: selection.startVerse,
        endVerse: selection.endVerse,
        wordIndex: rsvp.currentIndex,
        timestamp: Date.now(),
      });
    }
  }, [rsvp.currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track history
  useEffect(() => {
    onAddHistory({
      id: sessionId.current,
      book: selection.book,
      chapter: selection.chapter,
      startVerse: selection.startVerse,
      endVerse: selection.endVerse,
      startedAt: sessionStart.current,
      totalWords: words.length,
      wordsRead: rsvp.currentIndex + 1,
      speed: settings.speed,
    });
  }, [rsvp.currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentVerse = rsvp.currentWord?.verseRef ?? selection.startVerse;
  const favoriteId = `${selection.book}_${selection.chapter}_${currentVerse}`;
  const currentVerseData = verses.find((v) => v.verse === currentVerse);
  const isCurrentFavorite = isFavorite(selection.book, selection.chapter, currentVerse);

  const handleFavoriteToggle = () => {
    if (isCurrentFavorite) {
      onRemoveFavorite(favoriteId);
    } else if (currentVerseData) {
      onAddFavorite({
        id: favoriteId,
        book: selection.book,
        chapter: selection.chapter,
        verse: currentVerse,
        text: currentVerseData.text,
        savedAt: Date.now(),
      });
      setJustFavorited(true);
      setTimeout(() => setJustFavorited(false), 1500);
    }
  };

  const handleScreenTap = () => {
    if (!showFavorites && !showHistory && !showSettings) {
      setShowControls((prev) => !prev);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col select-none ${
        isDark ? 'bg-slate-900' : 'bg-gray-50'
      }`}
      onClick={handleScreenTap}
    >
      {/* Top Bar */}
      <div
        className={`flex items-center justify-between px-4 transition-all duration-300 ${
          showControls ? 'pt-12 pb-3 opacity-100' : 'pt-12 pb-3 opacity-0 pointer-events-none'
        } ${isDark ? 'bg-slate-900/90' : 'bg-gray-50/90'} backdrop-blur-sm`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Back */}
        <button
          onClick={() => onNavigate('select')}
          className={`p-2 rounded-xl ${
            isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-200 text-slate-600'
          }`}
        >
          <ArrowLeft size={24} />
        </button>

        {/* Center: Info */}
        <div className="flex flex-col items-center">
          <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {selection.book} {selection.chapter}
          </p>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Versículo {currentVerse}
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowFavorites(true)}
            className={`p-2 rounded-xl ${
              isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-200 text-slate-600'
            }`}
          >
            <Heart
              size={20}
              className={favorites.length > 0 ? 'text-rose-400' : ''}
              fill={favorites.length > 0 ? 'currentColor' : 'none'}
            />
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className={`p-2 rounded-xl ${
              isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-200 text-slate-600'
            }`}
          >
            <BookMarked size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowSettings((s) => !s); }}
            className={`p-2 rounded-xl ${
              isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-200 text-slate-600'
            }`}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Settings Dropdown */}
      {showSettings && (
        <div
          className={`mx-4 rounded-2xl p-4 border z-30 ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100 shadow-xl'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Configurações
            </p>
            <button
              onClick={() => setShowSettings(false)}
              className={`text-xs px-3 py-1 rounded-lg ${
                isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-slate-600'
              }`}
            >
              Fechar
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {isDark ? (
                <Moon size={18} className="text-amber-400" />
              ) : (
                <Sun size={18} className="text-amber-500" />
              )}
              <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                {isDark ? 'Modo Escuro' : 'Modo Claro'}
              </span>
            </div>
            <button
              onClick={() => onSettingsChange({ theme: isDark ? 'light' : 'dark' })}
              className={`relative w-12 h-6 rounded-full transition-all ${
                isDark ? 'bg-amber-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                  isDark ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Spritz Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.spritzMode ? (
                <Zap size={18} className="text-purple-400" />
              ) : (
                <ZapOff size={18} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
              )}
              <div>
                <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Modo Spritz
                </span>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Destaca a letra focal em vermelho
                </p>
              </div>
            </div>
            <button
              onClick={() => onSettingsChange({ spritzMode: !settings.spritzMode })}
              className={`relative w-12 h-6 rounded-full transition-all ${
                settings.spritzMode ? 'bg-purple-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                  settings.spritzMode ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Word Display Area */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative"
        style={{ minHeight: '50vh' }}
      >
        {/* Spritz guide line */}
        {settings.spritzMode && (
          <div className="absolute inset-x-0 flex justify-center pointer-events-none" style={{ top: '50%', transform: 'translateY(-60px)' }}>
            <div
              className={`h-px w-64 ${isDark ? 'bg-red-500/20' : 'bg-red-400/20'}`}
            />
          </div>
        )}

        {completed ? (
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <div className="text-6xl">🎉</div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Leitura Concluída!
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {selection.book} {selection.chapter}:{selection.startVerse}–{selection.endVerse}
            </p>
            <button
              onClick={() => {
                setCompleted(false);
                rsvp.restart();
              }}
              className="mt-4 px-6 py-3 rounded-xl bg-amber-500 text-white font-bold active:scale-95 transition-all"
            >
              Ler Novamente
            </button>
          </div>
        ) : (
          <>
            {/* Current Word */}
            <div
              className={`transition-opacity duration-75 ${wordAnimation ? 'opacity-100' : 'opacity-0'}`}
            >
              {rsvp.currentWord ? (
                settings.spritzMode ? (
                  <SpritzWord word={rsvp.currentWord.word} fontSize={settings.fontSize || 52} />
                ) : (
                  <p
                    className={`font-bold text-center px-6 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                    style={{ fontSize: `${settings.fontSize || 52}px`, lineHeight: 1.1 }}
                  >
                    {rsvp.currentWord.word}
                  </p>
                )
              ) : (
                <p className={`text-lg ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Nenhuma palavra
                </p>
              )}
            </div>

            {/* Spritz focal indicator */}
            {settings.spritzMode && (
              <div className="mt-2 flex justify-center">
                <div className="w-0.5 h-3 bg-red-500/40 rounded-full" />
              </div>
            )}

            {/* Verse context preview (visible when paused) */}
            {!rsvp.isPlaying && currentVerseData && (
              <div
                className={`mx-6 mt-6 rounded-2xl p-4 max-w-sm transition-all duration-300 ${
                  isDark
                    ? 'bg-slate-800/80 border border-slate-700/60'
                    : 'bg-white/80 border border-gray-100 shadow-lg'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <p
                  className={`text-xs font-bold mb-2 ${
                    isDark ? 'text-amber-400' : 'text-amber-600'
                  }`}
                >
                  {selection.book} {selection.chapter}:{currentVerse}
                </p>
                <p
                  className={`text-sm leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {currentVerseData.text}
                </p>
              </div>
            )}

            {/* Favorite current verse button */}
            <button
              onClick={(e) => { e.stopPropagation(); handleFavoriteToggle(); }}
              className={`mt-5 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
                isCurrentFavorite
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : isDark
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-rose-500/50'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-rose-300 shadow-sm'
              } ${justFavorited ? 'scale-110' : ''}`}
            >
              <Heart
                size={16}
                fill={isCurrentFavorite ? 'currentColor' : 'none'}
                className={isCurrentFavorite ? 'text-rose-400' : ''}
              />
              {isCurrentFavorite ? 'Favoritado ♥' : `Favoritar v.${currentVerse}`}
            </button>
          </>
        )}
      </div>

      {/* Progress Bar */}
      <div className={`px-4 ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
            style={{ width: `${rsvp.progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1 mb-2">
          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {Math.round(rsvp.progress)}%
          </span>
          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {rsvp.isPlaying ? `~${formatTime(rsvp.estimatedTimeLeft)}` : `${rsvp.currentIndex + 1}/${words.length}`}
          </span>
        </div>
      </div>

      {/* Controls Panel */}
      <div
        className={`transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        } ${isDark ? 'bg-slate-800/95 border-t border-slate-700' : 'bg-white/95 border-t border-gray-100 shadow-lg'} backdrop-blur-sm pb-10 pt-4 px-4`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Speed Control */}
        <div className="mb-5">
          <SpeedControl
            speed={settings.speed}
            onSpeedChange={(s) => onSettingsChange({ speed: s })}
            theme={settings.theme}
          />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Skip Back 10 */}
          <button
            onClick={() => rsvp.skipBackward(10)}
            className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all active:scale-90 ${
              isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-slate-600'
            }`}
          >
            <SkipBack size={22} />
            <span className="text-xs font-medium">-10</span>
          </button>

          {/* Restart */}
          <button
            onClick={() => { rsvp.restart(); setCompleted(false); }}
            className={`p-3 rounded-2xl transition-all active:scale-90 ${
              isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-slate-600'
            }`}
          >
            <RotateCcw size={22} />
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => {
              if (completed) {
                setCompleted(false);
                rsvp.restart();
                setTimeout(() => rsvp.play(), 100);
              } else {
                rsvp.isPlaying ? rsvp.pause() : rsvp.play();
              }
            }}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl ${
              rsvp.isPlaying
                ? 'bg-amber-500 hover:bg-amber-400'
                : 'bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500'
            } text-white`}
          >
            {rsvp.isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" className="ml-1" />}
          </button>

          {/* Skip Forward 10 */}
          <button
            onClick={() => rsvp.skipForward(10)}
            className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all active:scale-90 ${
              isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-slate-600'
            }`}
          >
            <SkipForward size={22} />
            <span className="text-xs font-medium">+10</span>
          </button>

          {/* Font Size */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onSettingsChange({ fontSize: Math.min((settings.fontSize || 52) + 4, 80) })}
              className={`p-2 rounded-xl transition-all active:scale-90 ${
                isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-slate-600'
              }`}
            >
              <ChevronUp size={18} />
            </button>
            <button
              onClick={() => onSettingsChange({ fontSize: Math.max((settings.fontSize || 52) - 4, 28) })}
              className={`p-2 rounded-xl transition-all active:scale-90 ${
                isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-slate-600'
              }`}
            >
              <ChevronDown size={18} />
            </button>
          </div>
        </div>

        {/* Word Seek Slider */}
        <div className="mt-4 px-2">
          <input
            type="range"
            min={0}
            max={Math.max(words.length - 1, 1)}
            value={rsvp.currentIndex}
            onChange={(e) => rsvp.seekTo(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer speed-slider"
            style={{
              background: `linear-gradient(to right, ${isDark ? '#f59e0b' : '#f59e0b'} 0%, ${isDark ? '#f59e0b' : '#f59e0b'} ${rsvp.progress}%, ${isDark ? '#334155' : '#e2e8f0'} ${rsvp.progress}%, ${isDark ? '#334155' : '#e2e8f0'} 100%)`,
            }}
          />
        </div>
      </div>

      {/* Favorites Panel */}
      {showFavorites && (
        <FavoritesPanel
          favorites={favorites}
          onRemove={onRemoveFavorite}
          onClose={() => setShowFavorites(false)}
          theme={settings.theme}
        />
      )}

      {/* History Panel */}
      {showHistory && (
        <HistoryPanel
          history={history}
          onClear={onClearHistory}
          onClose={() => setShowHistory(false)}
          theme={settings.theme}
        />
      )}
    </div>
  );
};

export default ReaderScreen;
