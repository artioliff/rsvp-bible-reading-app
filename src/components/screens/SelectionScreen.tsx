import React, { useState, useEffect } from 'react';
import { AppScreen, Book } from '../../types';
import { TRANSLATIONS, getChapterNumbers, getVerseNumbers } from '../../data/bibleData';
import { SelectionState } from '../../hooks/useAppState';
import { ArrowLeft, BookOpen, ChevronDown, Play, Loader2, AlertTriangle } from 'lucide-react';

interface SelectionScreenProps {
  onNavigate: (screen: AppScreen) => void;
  selection: SelectionState;
  onSelectionChange: (sel: SelectionState) => void;
  /** Livros da tradução ativa (vem do estado global — Fase 3) */
  books: Book[];
  /** Código da tradução ativa (ex.: 'ARA') */
  translation: string;
  /** Troca a tradução — dispara o recarregamento dos livros */
  onTranslationChange: (code: string) => void;
  /** true enquanto carrega public/data/{code}.json */
  isLoading: boolean;
  /** true se o fetch falhou e a amostra embutida está sendo exibida */
  isFallback: boolean;
}

const SelectionScreen: React.FC<SelectionScreenProps> = ({
  onNavigate,
  selection,
  onSelectionChange,
  books,
  translation,
  onTranslationChange,
  isLoading,
  isFallback,
}) => {
  const [localSel, setLocalSel] = useState<SelectionState>(selection);

  const chapters = getChapterNumbers(books, localSel.book);
  const startVerses = getVerseNumbers(books, localSel.book, localSel.chapter);
  const endVerses = startVerses.filter((v) => v >= localSel.startVerse);

  useEffect(() => {
    const chs = getChapterNumbers(books, localSel.book);
    const chapter = chs.includes(localSel.chapter) ? localSel.chapter : chs[0] ?? 1;
    const vs = getVerseNumbers(books, localSel.book, chapter);
    const sv = vs[0] ?? 1;
    const ev = vs[vs.length - 1] ?? sv;
    setLocalSel((prev) => ({ ...prev, chapter, startVerse: sv, endVerse: ev }));
  }, [localSel.book]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const vs = getVerseNumbers(books, localSel.book, localSel.chapter);
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

  const selectClass = `w-full appearance-none rounded-xl py-2 px-4 pr-10 text-base font-medium focus:outline-none focus:ring-2 transition-all bg-surface border border-line-strong text-ink focus:ring-inverse focus:border-inverse shadow-sm`;

  const labelClass = 'block text-sm font-semibold mb-2 text-ink';

  const atBooks = books.filter((b) => b.testament === 'AT');
  const ntBooks = books.filter((b) => b.testament === 'NT');

  return (
    <div className="min-h-screen flex flex-col bg-page">
      {/* Header */}
      <div className="flex items-center gap-4 p-2 bg-page border-b border-line shadow-sm">
        <button
          onClick={() => onNavigate('home')}
          className="p-2 rounded-xl transition-all hover:bg-surface-hover text-ink"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center brand-gradient">
            <BookOpen size={18} className="text-on-brand" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-ink">
              Seleção Bíblica
            </h1>
            <p className="text-xs text-ink-muted">
              Escolha a passagem para leitura
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 py-6 space-y-5 overflow-y-auto">
        {/* Fallback — fetch falhou, exibindo a amostra embutida */}
        {isFallback && (
          <div
            className="rounded-xl px-4 py-3 text-sm flex items-start gap-2 border bg-surface-pressed border-line-strong text-ink"
            role="alert"
          >
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <span>
              Tradução indisponível — exibindo amostra de 9 livros. Verifique a conexão.
            </span>
          </div>
        )}

        {/* Tradução */}
        <div>
          <label className={labelClass}>
            <span>Tradução</span>
            {isLoading && (
              <span className="inline-flex items-center gap-1.5 ml-2 font-normal text-ink">
                <Loader2 size={14} className="animate-spin" />
                Carregando…
              </span>
            )}
          </label>
          <div className="relative">
            <select value={translation} onChange={(e) => onTranslationChange(e.target.value)} className={selectClass} >
              {TRANSLATIONS.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-subtle"
            />
          </div>
        </div>

        {/* Book */}
        <div>
          <label className={labelClass}>Livro</label>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-subtle"
            />
          </div>
        </div>

        {/* Chapter */}
        <div>
          <label className={labelClass}>Capítulo</label>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-subtle"
            />
          </div>
        </div>

        {/* Verse Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Versículo Inicial</label>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-subtle"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Versículo Final</label>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-subtle"
              />
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div
          className="rounded-2xl p-4 bg-surface border border-line shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-ink">
            Passagem Selecionada
          </p>
          <p className="text-lg font-bold text-ink">
            {localSel.book} {localSel.chapter}:{localSel.startVerse}–{localSel.endVerse}
          </p>
          <p className="text-sm mt-1 text-ink-muted">
            {endVerses.length > 0
              ? `${localSel.endVerse - localSel.startVerse + 1} versículo(s) selecionado(s)`
              : 'Nenhum versículo disponível'}
          </p>
        </div>
      </div>

      {/* Start Button */}
      <div className="px-5 py-3 pt-4 bg-page border-t border-line">
        <button
          onClick={handleStart}
          disabled={startVerses.length === 0 || isLoading}
          className="w-full py-3 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all duration-200 active:scale-95 disabled:opacity-40 shadow-xl bg-inverse text-inverse-ink hover:bg-inverse-hover"
        >
          <Play size={24} fill="currentColor" />
          {isLoading ? 'Carregando tradução…' : 'Começar'}
        </button>
      </div>
    </div>
  );
};

export default SelectionScreen;
