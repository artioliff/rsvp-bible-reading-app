// Camada de dados bíblicos (Fase 2)
//
// Responsabilidades:
// 1. TRANSLATIONS — metadados das 18 traduções disponíveis em public/data/
// 2. loadTranslation(code) — carrega public/data/{code}.json com cache em
//    memória e fallback para a amostra embutida (offline / arquivo ausente)
// 3. Helpers puros de consulta — recebem `books` como primeiro argumento,
//    tornando-os independentes da fonte (amostra, fetch ou estado do app)
//
// Fluxo de dados: data-src/*.json → scripts/convert-bible-data.mjs → public/data/*.json
// Metadados das traduções: github.com/damarals/biblias
import type { Book, Chapter, Verse } from '../types/bible';
import { bibleBooks } from './sampleData';

// Amostra embutida (9 livros) — fonte inicial do app e fallback offline
export { bibleBooks };

// ---------------------------------------------------------------------------
// Traduções disponíveis
// ---------------------------------------------------------------------------

export interface TranslationInfo {
  /** Código = nome do arquivo em public/data/{code}.json */
  code: string;
  /** Nome de exibição completo */
  name: string;
  /** Ano da edição (quando conhecido) */
  year?: number;
  /** Editora (quando conhecida) */
  publisher?: string;
  /** true se o texto é domínio público (redistribuição livre) */
  publicDomain?: boolean;
}

export const TRANSLATIONS: TranslationInfo[] = [
  { code: 'ACF', name: 'Almeida Corrigida e Fiel', year: 1994, publisher: 'SBTB' },
  { code: 'ALM1911', name: 'Almeida 1911', year: 1911, publicDomain: true },
  { code: 'ARA', name: 'Almeida Revista e Atualizada', year: 1993, publisher: 'SBB' },
  { code: 'ARC', name: 'Almeida Revista e Corrigida', year: 1995, publisher: 'SBB' },
  { code: 'AS21', name: 'Almeida Século 21', year: 2009, publisher: 'Vida Nova' },
  { code: 'BLIVRE', name: 'Bíblia Livre', year: 2018, publicDomain: true },
  { code: 'JFAA', name: 'Almeida Atualizada' },
  { code: 'KJA', name: 'King James Atualizada', year: 1999, publisher: 'Abba Press' },
  { code: 'KJF', name: 'King James Fiel', year: 1611, publisher: 'BVBooks' },
  { code: 'MENS', name: 'A Mensagem', year: 2016, publisher: 'Editora Vida' },
  { code: 'NAA', name: 'Nova Almeida Atualizada', year: 2017, publisher: 'SBB' },
  { code: 'NBV', name: 'Nova Bíblia Viva', year: 2007, publisher: 'Mundo Cristão' },
  { code: 'NTLH', name: 'Nova Tradução na Linguagem de Hoje', year: 1988, publisher: 'SBB' },
  { code: 'NVI', name: 'Nova Versão Internacional', publisher: 'Biblica' },
  { code: 'NVT', name: 'Nova Versão Transformadora', year: 2016, publisher: 'Mundo Cristão' },
  { code: 'OL', name: 'O Livro', year: 2000, publisher: 'Biblica' },
  { code: 'TB', name: 'Tradução Brasileira', year: 2010, publisher: 'SBB', publicDomain: true },
  { code: 'VFL', name: 'Versão Fácil de Ler', year: 2017, publisher: 'Bible League International' },
];

/** Tradução padrão — decidida pelo usuário: ARA (Almeida Revista e Atualizada) */
export const DEFAULT_TRANSLATION_CODE = 'ARA';

// ---------------------------------------------------------------------------
// Carregamento com cache
// ---------------------------------------------------------------------------

/** URL base dos JSONs — respeita o base do Vite (ex.: GitHub Pages em subpasta) */
const DATA_BASE = `${import.meta.env.BASE_URL}data/`;

/**
 * Cache em memória: guarda a *promessa* para deduplicar chamadas concorrentes
 * e evitar refetch ao trocar de tela. Falhas nunca são memorizadas (retry).
 */
const translationCache = new Map<string, Promise<TranslationResult>>();

/** Validação leve — a validação completa acontece na conversão (Fase 1) */
const isBooksArray = (data: unknown): data is Book[] =>
  Array.isArray(data) &&
  data.length > 0 &&
  data.every((b) => b && typeof b === 'object' && Array.isArray((b as Book).chapters));

/** Resultado do carregamento de uma tradução */
export interface TranslationResult {
  /** Livros completos (66) — ou a amostra embutida em caso de falha */
  books: Book[];
  /** true quando o fetch falhou e a amostra embutida está sendo exibida */
  isFallback: boolean;
}

/**
 * Carrega uma tradução completa (66 livros) de public/data/{code}.json.
 *
 * - 1ª chamada: fetch (≈4,5 MB, servido/validado pelo Service Worker);
 *   a promessa fica cacheada — chamadas concorrentes compartilham o mesmo fetch.
 * - Falha (offline, HTTP ≠ 200, JSON inválido): resolve com a amostra
 *   embutida (9 livros) + isFallback: true; a próxima chamada tenta de novo.
 */
export function loadTranslation(code: string): Promise<TranslationResult> {
  const cached = translationCache.get(code);
  if (cached) return cached;

  const promise = (async (): Promise<TranslationResult> => {
    try {
      const res = await fetch(`${DATA_BASE}${code}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: unknown = await res.json();
      if (!isBooksArray(data)) throw new Error('formato inválido');
      return { books: data, isFallback: false };
    } catch (err) {
      console.warn(`⚠️ Falha ao carregar "${code}" (${err}); usando amostra embutida.`);
      translationCache.delete(code); // não memoriza a falha — permite retry
      return { books: bibleBooks, isFallback: true };
    }
  })();

  translationCache.set(code, promise);
  return promise;
}

/** Limpa o cache (recarga forçada / testes) */
export function clearTranslationCache(): void {
  translationCache.clear();
}

// ---------------------------------------------------------------------------
// Helpers puros de consulta (recebem `books`)
// ---------------------------------------------------------------------------

export const getBookByName = (books: Book[], name: string): Book | undefined =>
  books.find((b) => b.name === name);

export const getChapter = (
  books: Book[],
  bookName: string,
  chapterNum: number
): Chapter | undefined => {
  const book = getBookByName(books, bookName);
  return book?.chapters.find((c) => c.chapter === chapterNum);
};

export const getVerses = (
  books: Book[],
  bookName: string,
  chapterNum: number,
  startVerse: number,
  endVerse: number
): Verse[] => {
  const chapter = getChapter(books, bookName, chapterNum);
  if (!chapter) return [];
  return chapter.verses.filter((v) => v.verse >= startVerse && v.verse <= endVerse);
};

export const getAllWords = (verses: Verse[]): { word: string; verseRef: number }[] => {
  const words: { word: string; verseRef: number }[] = [];
  verses.forEach((v) => {
    const verseWords = v.text.split(/\s+/).filter((w) => w.length > 0);
    verseWords.forEach((word) => words.push({ word, verseRef: v.verse }));
  });
  return words;
};

export const getBookNames = (books: Book[]): string[] => books.map((b) => b.name);

export const getChapterNumbers = (books: Book[], bookName: string): number[] => {
  const book = getBookByName(books, bookName);
  return book ? book.chapters.map((c) => c.chapter) : [];
};

export const getVerseNumbers = (books: Book[], bookName: string, chapterNum: number): number[] => {
  const chapter = getChapter(books, bookName, chapterNum);
  return chapter ? chapter.verses.map((v) => v.verse) : [];
};
