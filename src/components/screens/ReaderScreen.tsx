import { useEffect, useRef, useState, useCallback } from 'react';
import { AppScreen, AppSettings, Book, FavoriteVerse, ReadingHistoryEntry, ReadingPosition, WordEntry } from '../../types';
import { getAllWords, getChapterNumbers, getVerseNumbers, getVerses } from '../../data/bibleData';
import { SelectionState } from '../../hooks/useAppState';
import useRSVP from '../../hooks/useRSVP';
import SpritzWord from '../reader/SpritzWord';
import SpeedControl from '../reader/SpeedControl';
import FavoritesPanel from '../panels/FavoritesPanel';
import HistoryPanel from '../panels/HistoryPanel';
import {
  ArrowLeft,
  Heart,
  BookMarked,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Sun,
  Moon,
  Zap,
  ZapOff,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ReaderScreenProps {
  onNavigate: (screen: AppScreen) => void;
  selection: SelectionState;
  /** Troca a seleção global (usado pelos botões de capítulo anterior/próximo) */
  onSelectionChange: (sel: SelectionState) => void;
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
  /** Livros da tradução ativa (vem do estado global — Fase 3) */
  books: Book[];
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
  onSelectionChange,
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
  books,
}) => {
  const isDark = settings.theme === 'dark';

  // Build word list
  const verses = getVerses(
    books,
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

  // ---------------------------------------------------------------------------
  // Layout fixo da palavra (Word Display Area)
  // A palavra fica centralizada fora do fluxo; o balão do versículo é quem
  // cresce para baixo. Estes valores reservam o espaço abaixo da palavra.
  // ---------------------------------------------------------------------------
  const wordFontSize = settings.fontSize || 52;
  const wordLineHeight = settings.spritzMode ? 1.2 : 1.1; // SpritzWord usa 1.2, <p> usa 1.1
  const spritzDotHeight = settings.spritzMode ? 8 + 12 : 0; // mt-2 + h-3 do indicador focal
  /** Altura total do bloco fixo (palavra + dot) e offset até onde o balão começa */
  const wordBlockHeight = wordFontSize * wordLineHeight + spritzDotHeight;
  const belowWordOffset = wordBlockHeight / 2 + 16;
  /** Linha guia Spritz — mesmo offset visual de antes (~0.42em acima do centro da palavra) */
  const spritzGuideTop = (wordFontSize * wordLineHeight) / 2 - wordFontSize * 0.42;

  // ---------------------------------------------------------------------------
  // Navegação de capítulo (botões "Ant." / "Próx.")
  // ---------------------------------------------------------------------------
  const chapters = getChapterNumbers(books, selection.book);
  const chapterIndex = chapters.indexOf(selection.chapter);
  const bookIndex = books.findIndex((b) => b.name === selection.book);

  /** Seleção de um capítulo inteiro (1º ao último versículo) */
  const buildTarget = (bookName: string, chapter: number): SelectionState => {
    const vs = getVerseNumbers(books, bookName, chapter);
    const startVerse = vs[0] ?? 1;
    const endVerse = vs[vs.length - 1] ?? startVerse;
    return { book: bookName, chapter, startVerse, endVerse };
  };

  /** Capítulo anterior — atravessa para o livro anterior no primeiro capítulo */
  const prevTarget: SelectionState | null =
    chapterIndex > 0
      ? buildTarget(selection.book, chapters[chapterIndex - 1])
      : bookIndex > 0
      ? books[bookIndex - 1].chapters.length > 0
        ? buildTarget(
            books[bookIndex - 1].name,
            books[bookIndex - 1].chapters[books[bookIndex - 1].chapters.length - 1].chapter
          )
        : null
      : null;

  /** Próximo capítulo — atravessa para o livro seguinte no último capítulo */
  const nextTarget: SelectionState | null =
    chapterIndex >= 0 && chapterIndex < chapters.length - 1
      ? buildTarget(selection.book, chapters[chapterIndex + 1])
      : bookIndex >= 0 && bookIndex < books.length - 1
      ? books[bookIndex + 1].chapters.length > 0
        ? buildTarget(books[bookIndex + 1].name, books[bookIndex + 1].chapters[0].chapter)
        : null
      : null;

  const goToChapter = (target: SelectionState | null) => {
    if (!target) return;
    // O `key` em App.tsx remonta a tela com a nova seleção
    onSelectionChange(target);
  };

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
      className="min-h-screen flex flex-col select-none bg-page"
      onClick={handleScreenTap}
    >
      {/* Top Bar */}
      <div
        className={`flex items-center justify-between p-2 transition-all duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } bg-surface-topbar backdrop-blur-sm`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Back */}
        <button
          onClick={() => onNavigate('select')}
          className="p-2 rounded-xl hover:bg-surface-hover text-ink"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Center: Info */}
        <div className="flex flex-col items-center">
          <p className="text-sm font-bold text-ink">
            {selection.book} {selection.chapter}
          </p>
          <p className="text-xs text-ink-muted">
            Versículo {currentVerse}
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowFavorites(true)}
            className="p-2 rounded-xl hover:bg-surface-hover text-ink"
          >
            <Heart
              size={20}
              fill={favorites.length > 0 ? 'currentColor' : 'none'}
            />
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 rounded-xl hover:bg-surface-hover text-ink"
          >
            <BookMarked size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowSettings((s) => !s); }}
            className="p-2 rounded-xl hover:bg-surface-hover text-ink"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Settings Dropdown */}
      {showSettings && (
        <div
          className="mx-4 rounded-2xl p-4 border border-line bg-surface shadow-xl z-30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-ink">
              Configurações
            </p>
            <button
              onClick={() => setShowSettings(false)}
              className="text-xs px-3 py-1 rounded-lg bg-surface-hover text-ink"
            >
              Fechar
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {isDark ? (
                <Moon size={18} className="text-ink" />
              ) : (
                <Sun size={18} className="text-ink" />
              )}
              <span className="text-sm font-medium text-ink">
                {isDark ? 'Modo Escuro' : 'Modo Claro'}
              </span>
            </div>
            <button
              onClick={() => onSettingsChange({ theme: isDark ? 'light' : 'dark' })}
              className={`relative w-12 h-6 rounded-full transition-all ${
                isDark ? 'bg-inverse' : 'bg-line-strong'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full shadow transition-all bg-page ${
                  isDark ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Spritz Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {settings.spritzMode ? (
                <Zap size={18} className="text-ink" />
              ) : (
                <ZapOff size={18} className="text-ink-subtle" />
              )}
              <div>
                <span className="text-sm font-medium text-ink">
                  Modo Spritz
                </span>
                <p className="text-xs text-ink-muted">
                  Destaca a letra focal em vermelho
                </p>
              </div>
            </div>
            <button
              onClick={() => onSettingsChange({ spritzMode: !settings.spritzMode })}
              className={`relative w-12 h-6 rounded-full transition-all ${
                settings.spritzMode ? 'bg-inverse' : 'bg-line-strong'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full shadow transition-all ${
                  settings.spritzMode ? 'left-7' : 'left-1'
                } ${isDark && !settings.spritzMode ? 'bg-inverse' : 'bg-inverse-ink'}`}
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
        {completed ? (
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-bold text-ink">
              Leitura Concluída!
            </h2>
            <p className="text-sm text-ink-muted">
              {selection.book} {selection.chapter}:{selection.startVerse}–{selection.endVerse}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setCompleted(false);
                  rsvp.restart();
                }}
                className="px-6 py-3 rounded-xl font-bold active:scale-95 transition-all bg-inverse text-inverse-ink"
              >
                Ler Novamente
              </button>
              {nextTarget && (
                <button
                  onClick={() => goToChapter(nextTarget)}
                  className="px-6 py-3 rounded-xl font-bold active:scale-95 transition-all border border-line-strong text-ink hover:bg-surface-pressed"
                >
                  Próximo capítulo
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Current Word — posição fixa no centro da área de leitura */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center px-6">
              {/* Spritz guide line */}
              {settings.spritzMode && (
                <div
                  className="absolute inset-x-0 flex justify-center pointer-events-none"
                  style={{ top: `${spritzGuideTop}px` }}
                >
                  <div className="h-px w-64 bg-spritz-guide" />
                </div>
              )}

              <div
                className={`transition-opacity duration-75 ${wordAnimation ? 'opacity-100' : 'opacity-0'}`}
              >
                {rsvp.currentWord ? (
                  settings.spritzMode ? (
                    <SpritzWord word={rsvp.currentWord.word} fontSize={wordFontSize} />
                  ) : (
                    <p
                      className="font-bold text-center px-6 text-ink"
                      style={{ fontSize: `${wordFontSize}px`, lineHeight: 1.1 }}
                    >
                      {rsvp.currentWord.word}
                    </p>
                  )
                ) : (
                  <p className="text-lg text-ink-muted">
                    Nenhuma palavra
                  </p>
                )}
              </div>

              {/* Spritz focal indicator */}
              {settings.spritzMode && (
                <div className="mt-2 flex justify-center">
                  <div className="w-0.5 h-3 bg-spritz-dot rounded-full" />
                </div>
              )}
            </div>

            {/* Conteúdo abaixo da palavra — cresce para baixo sem deslocá-la */}
            <div
              className="absolute inset-x-0 top-1/2 bottom-0 overflow-y-auto flex flex-col items-center"
              style={{ paddingTop: `${belowWordOffset}px` }}
            >
              {/* Verse context preview (visible when paused) */}
              {!rsvp.isPlaying && currentVerseData && (
                <div
                  className="mx-6 rounded-2xl p-4 max-w-sm transition-all duration-300 bg-surface-translucent border border-line shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-xs font-bold mb-2 text-ink">
                    {selection.book} {selection.chapter}:{currentVerse}
                  </p>
                  <p className="text-sm leading-relaxed text-ink">
                    {currentVerseData.text}
                  </p>
                </div>
              )}

              {/* Favorite current verse button */}
              <button
                onClick={(e) => { e.stopPropagation(); handleFavoriteToggle(); }}
                className={`mt-5 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
                  isCurrentFavorite
                    ? 'bg-inverse text-inverse-ink border-inverse'
                    : 'bg-surface text-ink-muted border border-line-strong hover:border-line-hover shadow-sm'
                } ${justFavorited ? 'scale-110' : ''}`}
              >
                <Heart
                  size={16}
                  fill={isCurrentFavorite ? 'currentColor' : 'none'}
                />
                {isCurrentFavorite ? 'Favoritado ♥' : `Favoritar v.${currentVerse}`}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Progress Bar — também funciona como seek slider */}
      <div className="px-4 py-2 bg-page">
        <input
          type="range"
          min={0}
          max={Math.max(words.length - 1, 1)}
          value={rsvp.currentIndex}
          onChange={(e) => rsvp.seekTo(parseInt(e.target.value))}
          className="w-full appearance-none cursor-pointer progress-seek"
          style={{ '--progress': `${rsvp.progress}%` } as React.CSSProperties}
          aria-label="Avançar ou retroceder na leitura"
        />
        <div className="flex justify-between items-center mt-1 mb-2">
          <span className="text-xs text-ink-muted">
            {Math.round(rsvp.progress)}%
          </span>
          <span className="text-xs text-ink-muted">
            {rsvp.isPlaying ? `~${formatTime(rsvp.estimatedTimeLeft)}` : `${rsvp.currentIndex + 1}/${words.length}`}
          </span>
        </div>
      </div>

      {/* Controls Panel */}
      <div
        className={`transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        } bg-surface-bar border-t border-line shadow-lg backdrop-blur-sm pb-10 pt-4 px-4`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Speed Control */}
        <div className="mb-5">
          <SpeedControl
            speed={settings.speed}
            onSpeedChange={(s) => onSettingsChange({ speed: s })}
          />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Previous Chapter */}
          <button
            onClick={() => goToChapter(prevTarget)}
            disabled={!prevTarget}
            title={prevTarget ? `Anterior: ${prevTarget.book} ${prevTarget.chapter}` : 'Início da Bíblia'}
            aria-label={prevTarget ? `Capítulo anterior: ${prevTarget.book} ${prevTarget.chapter}` : 'Capítulo anterior indisponível'}
            className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
              prevTarget
                ? `active:scale-90 hover:bg-surface-hover text-ink`
                : `cursor-not-allowed opacity-40 text-ink-faint`
            }`}
          >
            <ChevronLeft size={22} />
            <span className="text-xs font-medium">Ant.</span>
          </button>

          {/* Restart */}
          <button
            onClick={() => { rsvp.restart(); setCompleted(false); }}
            className="p-3 rounded-2xl transition-all active:scale-90 hover:bg-surface-hover text-ink"
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
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl bg-inverse text-inverse-ink hover:bg-inverse-hover"
          >
            {rsvp.isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>

          {/* Next Chapter */}
          <button
            onClick={() => goToChapter(nextTarget)}
            disabled={!nextTarget}
            title={nextTarget ? `Próximo: ${nextTarget.book} ${nextTarget.chapter}` : 'Fim da Bíblia'}
            aria-label={nextTarget ? `Próximo capítulo: ${nextTarget.book} ${nextTarget.chapter}` : 'Próximo capítulo indisponível'}
            className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
              nextTarget
                ? `active:scale-90 hover:bg-surface-hover text-ink`
                : `cursor-not-allowed opacity-40 text-ink-faint`
            }`}
          >
            <ChevronRight size={22} />
            <span className="text-xs font-medium">Próx.</span>
          </button>

          {/* Font Size */}
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onSettingsChange({ fontSize: Math.min((settings.fontSize || 52) + 4, 80) })}
              className="p-2 rounded-xl transition-all active:scale-90 hover:bg-surface-hover text-ink"
            >
              <ChevronUp size={18} />
            </button>
            <button
              onClick={() => onSettingsChange({ fontSize: Math.max((settings.fontSize || 52) - 4, 28) })}
              className="p-2 rounded-xl transition-all active:scale-90 hover:bg-surface-hover text-ink"
            >
              <ChevronDown size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Favorites Panel */}
      {showFavorites && (
        <FavoritesPanel
          favorites={favorites}
          onRemove={onRemoveFavorite}
          onClose={() => setShowFavorites(false)}
        />
      )}

      {/* History Panel */}
      {showHistory && (
        <HistoryPanel
          history={history}
          onClear={onClearHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};

export default ReaderScreen;
