import React from 'react';
import { AppScreen, ReadingPosition, Theme } from '../types';
import { BookOpen, BookMarked, Clock, ChevronRight, Sun, Moon, Heart } from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (screen: AppScreen) => void;
  lastPosition: ReadingPosition | null;
  theme: Theme;
  onToggleTheme: () => void;
  historyCount: number;
  favoritesCount: number;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  lastPosition,
  theme,
  onToggleTheme,
  historyCount,
  favoritesCount,
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDark
          ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-b from-amber-50 via-orange-50 to-amber-50'
      }`}
    >
      {/* Header */}
      <div className="flex justify-end p-4">
        <button
          onClick={onToggleTheme}
          className={`p-3 rounded-full transition-all duration-200 ${
            isDark
              ? 'bg-slate-700 hover:bg-slate-600 text-amber-400'
              : 'bg-white hover:bg-amber-100 text-slate-700 shadow-md'
          }`}
          aria-label="Alternar tema"
        >
          {isDark ? <Sun size={22} /> : <Moon size={22} />}
        </button>
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Logo */}
        <div className="relative mb-6">
          <div
            className={`w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl ${
              isDark
                ? 'bg-gradient-to-br from-amber-500 to-amber-700'
                : 'bg-gradient-to-br from-amber-400 to-amber-600'
            }`}
          >
            <BookOpen size={56} className="text-white" strokeWidth={1.5} />
          </div>
          <div
            className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
              isDark ? 'bg-amber-400' : 'bg-amber-500'
            }`}
          >
            <span className="text-white text-xs font-bold">⚡</span>
          </div>
        </div>

        {/* App Name */}
        <h1
          className={`text-3xl font-bold text-center leading-tight mb-2 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}
        >
          Leitura Bíblica
        </h1>
        <h2
          className={`text-2xl font-bold text-center mb-2 ${
            isDark ? 'text-amber-400' : 'text-amber-600'
          }`}
        >
          Rápida
        </h2>
        <p
          className={`text-center text-sm mb-10 max-w-xs leading-relaxed ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          Leia a Bíblia palavra por palavra com a técnica RSVP — foco total, sem distrações.
        </p>

        {/* Main CTA */}
        <button
          onClick={() => onNavigate('select')}
          className={`w-full max-w-xs py-5 rounded-2xl font-bold text-xl shadow-xl transition-all duration-200 active:scale-95 ${
            isDark
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white'
          }`}
        >
          Iniciar Leitura
        </button>

        {/* Continue Reading */}
        {lastPosition && (
          <button
            onClick={() => onNavigate('reader')}
            className={`mt-4 w-full max-w-xs py-4 rounded-2xl flex items-center justify-between px-5 transition-all duration-200 active:scale-95 border-2 ${
              isDark
                ? 'border-slate-600 hover:border-amber-500 bg-slate-800 text-white'
                : 'border-amber-200 hover:border-amber-400 bg-white text-slate-800 shadow-md'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock size={20} className={isDark ? 'text-amber-400' : 'text-amber-500'} />
              <div className="text-left">
                <p className="font-semibold text-sm">Continuar de onde parou</p>
                <p
                  className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                >
                  {lastPosition.book} {lastPosition.chapter}:{lastPosition.startVerse}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
          </button>
        )}

        {/* Stats Row */}
        <div className="flex gap-4 mt-8 w-full max-w-xs">
          <div
            className={`flex-1 rounded-2xl p-4 text-center ${
              isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white shadow-md'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <Heart
                size={20}
                className={isDark ? 'text-rose-400' : 'text-rose-500'}
                fill={favoritesCount > 0 ? 'currentColor' : 'none'}
              />
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {favoritesCount}
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Favoritos
            </p>
          </div>
          <div
            className={`flex-1 rounded-2xl p-4 text-center ${
              isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white shadow-md'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <BookMarked
                size={20}
                className={isDark ? 'text-blue-400' : 'text-blue-500'}
              />
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {historyCount}
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Sessões
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-8 px-6 text-center">
        <p className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
          Bíblia em Português • Almeida Revista e Corrigida
        </p>
      </div>
    </div>
  );
};

export default HomeScreen;
