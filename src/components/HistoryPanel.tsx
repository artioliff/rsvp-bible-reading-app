import React from 'react';
import { ReadingHistoryEntry, Theme } from '../types';
import { BookMarked, Trash2, X, Clock } from 'lucide-react';

interface HistoryPanelProps {
  history: ReadingHistoryEntry[];
  onClear: () => void;
  onClose: () => void;
  theme: Theme;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClear, onClose, theme }) => {
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

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
            <BookMarked size={20} className={isDark ? 'text-blue-400' : 'text-blue-500'} />
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Histórico de Leitura
            </h2>
          </div>
          <div className="flex gap-2">
            {history.length > 0 && (
              <button
                onClick={onClear}
                className={`p-2 rounded-xl ${
                  isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-xl ${
                isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Clock size={40} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
              <p className={`text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Nenhuma sessão de leitura registrada.
              </p>
            </div>
          ) : (
            history.map((entry) => {
              const pct = Math.round((entry.wordsRead / entry.totalWords) * 100);
              return (
                <div
                  key={entry.id}
                  className={`rounded-2xl p-4 ${
                    isDark
                      ? 'bg-slate-700 border border-slate-600'
                      : 'bg-blue-50 border border-blue-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {entry.book} {entry.chapter}:{entry.startVerse}–{entry.endVerse}
                    </p>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        pct >= 100
                          ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                          : isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {pct >= 100 ? '✓ Concluído' : `${pct}%`}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div
                    className={`h-1.5 rounded-full mb-2 ${isDark ? 'bg-slate-600' : 'bg-blue-100'}`}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <div className={`flex items-center gap-4 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
