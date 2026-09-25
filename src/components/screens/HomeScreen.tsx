import React from 'react';
import { AppScreen, ReadingPosition } from '../../types';
import { BookOpen, BookMarked, Clock, ChevronRight, Sun, Heart } from 'lucide-react';
import { TRANSLATIONS } from '../../data/bibleData';

interface HomeScreenProps {
  onNavigate: (screen: AppScreen) => void;
  lastPosition: ReadingPosition | null;
  onToggleTheme: () => void;
  historyCount: number;
  favoritesCount: number;
  /** Código da tradução ativa — o rodapé exibe o nome oficial */
  translation: string;
}

// Aliases de classes semânticas — todas as cores vivem em src/index.css
// (ver docs/paleta-de-cores.md)
const shadow = 'shadow-card';

const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  lastPosition,
  onToggleTheme,
  historyCount,
  favoritesCount,
  translation,
}) => {
  const translationName = TRANSLATIONS.find((t) => t.code === translation)?.name ?? translation;

  // Texto principal da página (tema resolvido pelo CSS via data-theme)
  const pageText = 'text-ink';
  // Cards/CTA com inversão espelhada ao tema: bg-inverted + texto invertido
  const card = 'bg-inverse text-inverse-ink';
  const cardHover = 'hover:bg-inverse-hover';
  const cardSub = 'text-inverse-ink-dim';

  return (
    <div className="min-h-screen flex flex-col bg-page">
      {/* Header — sol no canto superior direito (alterna o tema das outras telas) */}
      <div className="flex justify-end p-4">
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-full ${pageText} transition-opacity duration-200 hover:opacity-60 active:scale-95`}
          aria-label="Alternar tema"
        >
          <Sun size={24} />
        </button>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Logo — quadrado laranja vibrante + livro branco (acento principal) */}
        <div className="mb-6 w-28 h-28 rounded-3xl brand-gradient flex items-center justify-center shadow-xl">
          <BookOpen size={56} className="text-on-brand" strokeWidth={1.5} />
        </div>

        {/* Títulos */}
        <h1 className={`text-3xl font-bold text-center leading-tight mb-2 ${pageText}`}>
          Leitura Bíblica
        </h1>
        <h2 className={`text-2xl font-bold text-center mb-2 ${pageText}`}>Rápida</h2>
        <p className={`text-center text-sm mb-10 max-w-xs leading-relaxed ${pageText}`}>
          Leia a Bíblia palavra por palavra com a técnica RSVP — foco total, sem distrações.
        </p>

        {/* CTA primário — cantos super-elípticos (raio alto) */}
        <button
          onClick={() => onNavigate('select')}
          className={`w-full max-w-xs py-5 rounded-[28px] font-bold text-xl ${card} ${shadow} transition-all duration-200 ${cardHover} active:scale-95`}
        >
          Iniciar Leitura
        </button>

        {/* Continuar de onde parou */}
        {lastPosition && (
          <button
            onClick={() => onNavigate('reader')}
            className={`mt-4 w-full max-w-xs py-4 px-5 rounded-[28px] flex items-center justify-between ${card} ${shadow} transition-all duration-200 ${cardHover} active:scale-95`}
          >
            <div className="flex items-center gap-3 text-left">
              <Clock size={20} />
              <div>
                <p className="font-semibold text-sm">Continuar de onde parou</p>
                <p className={`text-xs mt-0.5 ${cardSub}`}>
                  {lastPosition.book} {lastPosition.chapter}:{lastPosition.startVerse}
                </p>
              </div>
            </div>
            <ChevronRight size={20} />
          </button>
        )}

        {/* Estatísticas — dois cards lado a lado */}
        <div className="flex gap-4 mt-8 w-full max-w-xs">
          <div className={`flex-1 rounded-[24px] p-4 text-center ${card} ${shadow}`}>
            <div className="flex items-center justify-center mb-2">
              <Heart size={20} fill={favoritesCount > 0 ? 'currentColor' : 'none'} />
            </div>
            <p className="text-2xl font-bold">{favoritesCount}</p>
            <p className={`text-xs mt-1 ${cardSub}`}>Favoritos</p>
          </div>
          <div className={`flex-1 rounded-[24px] p-4 text-center ${card} ${shadow}`}>
            <div className="flex items-center justify-center mb-2">
              <BookMarked size={20} />
            </div>
            <p className="text-2xl font-bold">{historyCount}</p>
            <p className={`text-xs mt-1 ${cardSub}`}>Sessões</p>
          </div>
        </div>
      </div>

      {/* Rodapé — nome oficial da tradução ativa (Fase 3) */}
      <div className="pb-8 px-6 text-center">
        <p className={`text-xs ${pageText}`}>Bíblia em Português • {translationName}</p>
      </div>
    </div>
  );
};

export default HomeScreen;
