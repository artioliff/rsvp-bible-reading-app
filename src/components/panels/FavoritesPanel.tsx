import React from 'react';
import { FavoriteVerse } from '../../types';
import { Heart, Trash2, X } from 'lucide-react';

interface FavoritesPanelProps {
  favorites: FavoriteVerse[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

// Cores via classes semânticas — tokens em src/index.css (docs/paleta-de-cores.md)
const FavoritesPanel: React.FC<FavoritesPanelProps> = ({ favorites, onRemove, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[80vh] flex flex-col bg-surface border border-surface-border">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-line-strong" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div className="flex items-center gap-3">
            <Heart size={20} className="text-ink" fill="currentColor" />
            <h2 className="text-lg font-bold text-ink">Versículos Favoritos</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface-hover text-ink-muted"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Heart size={40} className="text-line-strong" />
              <p className="text-center text-ink-muted">
                Nenhum versículo favoritado ainda.{'\n'}Durante a leitura, toque no ❤️ para salvar.
              </p>
            </div>
          ) : (
            favorites.map((fav) => (
              <div
                key={fav.id}
                className="rounded-2xl p-4 flex gap-3 bg-surface-subtle border border-line"
              >
                <div className="flex-1">
                  <p className="text-xs font-bold mb-2 text-ink">
                    {fav.book} {fav.chapter}:{fav.verse}
                  </p>
                  <p className="text-sm leading-relaxed text-ink">"{fav.text}"</p>
                  <p className="text-xs mt-2 text-ink-muted">
                    {new Date(fav.savedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(fav.id)}
                  className="p-2 rounded-xl self-start hover:bg-surface-hover text-ink-muted"
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
