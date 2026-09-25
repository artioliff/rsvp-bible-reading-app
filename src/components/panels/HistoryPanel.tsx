import React from 'react';
import { ReadingHistoryEntry } from '../../types';
import { BookMarked, Trash2, X, Clock } from 'lucide-react';

interface HistoryPanelProps {
  history: ReadingHistoryEntry[];
  onClear: () => void;
  onClose: () => void;
}

// Cores via classes semânticas — tokens em src/index.css (docs/paleta-de-cores.md)
const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClear, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[80vh] flex flex-col bg-surface border border-surface-border">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-line-strong" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div className="flex items-center gap-3">
            <BookMarked size={20} className="text-ink" />
            <h2 className="text-lg font-bold text-ink">Histórico de Leitura</h2>
          </div>
          <div className="flex gap-2">
            {history.length > 0 && (
              <button
                onClick={onClear}
                className="p-2 rounded-xl hover:bg-surface-hover text-ink-muted"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-surface-hover text-ink-muted"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Clock size={40} className="text-line-strong" />
              <p className="text-center text-ink-muted">Nenhuma sessão de leitura registrada.</p>
            </div>
          ) : (
            history.map((entry) => {
              const pct = Math.round((entry.wordsRead / entry.totalWords) * 100);
              return (
                <div
                  key={entry.id}
                  className="rounded-2xl p-4 bg-surface-subtle border border-line"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-ink">
                      {entry.book} {entry.chapter}:{entry.startVerse}–{entry.endVerse}
                    </p>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        pct >= 100 ? 'bg-inverse text-inverse-ink' : 'bg-surface-hover text-ink'
                      }`}
                    >
                      {pct >= 100 ? '✓ Concluído' : `${pct}%`}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full mb-2 bg-line">
                    <div
                      className="h-full rounded-full bg-inverse"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-ink-muted">
                    <span>{entry.speed} ppm</span>
                    <span>•</span>
                    <span>{entry.wordsRead}/{entry.totalWords} palavras</span>
                    <span>•</span>
                    <span>{new Date(entry.startedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;
