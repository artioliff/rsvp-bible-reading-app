import React, { useState, useEffect } from 'react';
import { AppScreen, Theme } from '../types';
import { bibleBooks, getChapterNumbers, getVerseNumbers } from '../data/bibleData';
import { SelectionState } from '../hooks/useAppState';
import { ArrowLeft, BookOpen, ChevronDown, Play } from 'lucide-react';

interface SelectionScreenProps {
  onNavigate: (screen: AppScreen) => void;
  selection: SelectionState;
  onSelectionChange: (sel: SelectionState) => void;
  theme: Theme;
}

const SelectionScreen: React.FC<SelectionScreenProps> = ({
  onNavigate,
  selection,
  onSelectionChange,
  theme,
}) => {
  const isDark = theme === 'dark';

  const [localSel, setLocalSel] = useState<SelectionState>(selection);

  const chapters = getChapterNumbers(localSel.book);
  const startVerses = getVerseNumbers(localSel.book, localSel.chapter);
  const endVerses = startVerses.filter((v) => v >= localSel.startVerse);

  useEffect(() => {
    const chs = getChapterNumbers(localSel.book);
    const chapter = chs.includes(localSel.chapter) ? localSel.chapter : chs[0] ?? 1;
    const vs = getVerseNumbers(localSel.book, chapter);
    const sv = vs[0] ?? 1;
    const ev = vs[vs.length - 1] ?? sv;
    setLocalSel((prev) => ({ ...prev, chapter, startVerse: sv, endVerse: ev }));
  }, [localSel.book]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const vs = getVerseNumbers(localSel.book, localSel.chapter);
    const sv = vs[0] ?? 1;
    const ev = vs[vs.length - 1] ?? sv;
    setLocalSel((prev) => ({ ...prev, startVerse: sv, endVerse: ev }));
  }, [localSel.chapter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (localSel.endVerse < localSel.startVerse) {
      setLocalSel((prev) => ({ ...prev, endVerse: prev.startVerse }));
    }
  }, [localSel.startVerse]);

  const handleStart = () => {
    onSelectionChange(localSel);
    onNavigate('reader');
  };

  const selectClass = `w-full appearance-none rounded-xl py-4 px-4 pr-10 text-base font-medium focus:outline-none focus:ring-2 transition-all ${
    isDark
      ? 'bg-slate-700 border border-slate-600 text-white focus:ring-amber-500 focus:border-amber-500'
      : 'bg-white border border-amber-200 text-slate-800 focus:ring-amber-400 focus:border-amber-400 shadow-sm'
  }`;

  const labelClass = `block text-sm font-semibold mb-2 ${
    isDark ? 'text-slate-300' : 'text-slate-600'
  }`;

  const atBooks = bibleBooks.filter((b) => b.testament === 'AT');
  const ntBooks = bibleBooks.filter((b) => b.testament === 'NT');

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDark ? 'bg-slate-900' : 'bg-amber-50'
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center gap-4 px-4 pt-12 pb-6 ${
          isDark
            ? 'bg-slate-800 border-b border-slate-700'
            : 'bg-white border-b border-amber-100 shadow-sm'
        }`}
      >
        <button
          onClick={() => onNavigate('home')}
          className={`p-2 rounded-xl transition-all ${
            isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-amber-50 text-slate-600'
          }`}
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-amber-500' : 'bg-amber-500'
            }`}
          >
            <BookOpen size={18} className="text-white" />
          </div>
          <div>
            <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Seleção Bíblica
            </h1>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Escolha a passagem para leitura
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 py-6 space-y-5 overflow-y-auto">
        {/* Book */}
        <div>
          <label className={labelClass}>📖 Livro</label>
          <div className="relative">
            <select
              value={localSel.book}
              onChange={(e) => setLocalSel((prev) => ({ ...prev, book: e.target.value }))}
              className={selectClass}
            >
              <optgroup label="Antigo Testamento">
                {atBooks.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.abbreviation})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Novo Testamento">
                {ntBooks.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.abbreviation})
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown
              size={18}
              className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                isDark ? 'text-slate-400' : 'text-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Chapter */}
        <div>
          <label className={labelClass}>📑 Capítulo</label>
          <div className="relative">
            <select
              value={localSel.chapter}
              onChange={(e) =>
                setLocalSel((prev) => ({ ...prev, chapter: parseInt(e.target.value) }))
              }
              className={selectClass}
            >
              {chapters.map((c) => (
                <option key={c} value={c}>
                  Capítulo {c}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                isDark ? 'text-slate-400' : 'text-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Verse Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>🔢 Versículo Inicial</label>
            <div className="relative">
              <select
                value={localSel.startVerse}
                onChange={(e) =>
                  setLocalSel((prev) => ({ ...prev, startVerse: parseInt(e.target.value) }))
                }
                className={selectClass}
              >
                {startVerses.map((v) => (
                  <option key={v} value={v}>
                    Versículo {v}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isDark ? 'text-slate-400' : 'text-slate-400'
                }`}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>🔢 Versículo Final</label>
            <div className="relative">
              <select
                value={localSel.endVerse}
                onChange={(e) =>
                  setLocalSel((prev) => ({ ...prev, endVerse: parseInt(e.target.value) }))
                }
                className={selectClass}
              >
                {endVerses.map((v) => (
                  <option key={v} value={v}>
                    Versículo {v}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isDark ? 'text-slate-400' : 'text-slate-400'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div
          className={`rounded-2xl p-5 ${
            isDark
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-white border border-amber-100 shadow-md'
          }`}
        >
          <p
            className={`text-xs font-semibold uppercase tracking-widest mb-2 ${
              isDark ? 'text-amber-400' : 'text-amber-600'
            }`}
          >
            Passagem Selecionada
          </p>
          <p
            className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}
          >
            {localSel.book} {localSel.chapter}:{localSel.startVerse}–{localSel.endVerse}
          </p>
          <p
            className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            {endVerses.length > 0
              ? `${localSel.endVerse - localSel.startVerse + 1} versículo(s) selecionado(s)`
              : 'Nenhum versículo disponível'}
          </p>
        </div>
      </div>

      {/* Start Button */}
      <div
        className={`px-5 pb-10 pt-4 ${
          isDark ? 'bg-slate-900 border-t border-slate-800' : 'bg-amber-50 border-t border-amber-100'
        }`}
      >
        <button
          onClick={handleStart}
          disabled={startVerses.length === 0}
          className="w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all duration-200 active:scale-95 disabled:opacity-40 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-xl"
        >
          <Play size={24} fill="white" />
          Começar
        </button>
      </div>
    </div>
  );
};

export default SelectionScreen;
