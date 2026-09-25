import React from 'react';
import { FavoriteVerse, Theme } from '../types';
import { Heart, Trash2, X } from 'lucide-react';

interface FavoritesPanelProps {
  favorites: FavoriteVerse[];
  onRemove: (id: string) => void;
  onClose: () => void;
  theme: Theme;
}

const FavoritesPanel: React.FC<FavoritesPanelProps> = ({
  favorites,
  onRemove,
  onClose,
  theme,
}) => {
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[80vh] flex flex-col ${
          isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        }`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
        </div>

        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDark ? 'border-slate-700' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <Heart size={20} className="text-rose-400" fill="currentColor" />
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Versículos Favoritos
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl ${
              isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Heart size={40} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
              <p className={`text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Nenhum versículo favoritado ainda.{'\n'}Durante a leitura, toque no ❤️ para salvar.
              </p>
            </div>
          ) : (
            favorites.map((fav) => (
              <div
                key={fav.id}
                className={`rounded-2xl p-4 flex gap-3 ${
                  isDark
                    ? 'bg-slate-700 border border-slate-600'
                    : 'bg-rose-50 border border-rose-100'
                }`}
              >
                <div className="flex-1">
                  <p
                    className={`text-xs font-bold mb-2 ${
                      isDark ? 'text-amber-400' : 'text-amber-600'
                    }`}
                  >
                    {fav.book} {fav.chapter}:{fav.verse}
                  </p>
                  <p
                    className={`text-sm leading-relaxed ${
                      isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}
                  >
                    "{fav.text}"
                  </p>
                  <p
                    className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                  >
                    {new Date(fav.savedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(fav.id)}
                  className={`p-2 rounded-xl self-start ${
                    isDark ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-rose-100 text-slate-400'
                  }`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPanel;
