/**
 * Script de conversão dos JSONs bíblicos (data-src) para o formato do app.
 *
 * Entrada (formato original):
 *   [{ "abbrev": "Gn", "name": "Gênesis", "chapters": [["texto", ...], ...] }]
 *
 * Saída (public/data — formato Book/Chapter/Verse de bibleData.ts):
 *   [{
 *     "id": 1,
 *     "name": "Gênesis",
 *     "abbreviation": "Gn",
 *     "testament": "AT" | "NT",
 *     "chapters": [
 *       { "chapter": 1, "verses": [{ "verse": 1, "text": "..." }] }
 *     ]
 *   }]
 *
 * Regras:
 *   - id = índice do livro + 1 (ordem canônica protestante: Gn=1 ... Ap=66)
 *   - testament: índices 0–38 (Gênesis→Malaquias) = "AT", 39–65 (Mateus→Apocalipse) = "NT"
 *   - Numeração de capítulos e versículos 1-based
 *   - Texto com trim() (remove espaços sobrando dos arquivos originais)
 *   - JSON de saída compacto (sem indentação) para fetch menor
 *
 * Uso: node scripts/convert-bible-data.mjs   (ou: npm run convert:data)
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC_DIR = join(ROOT, 'data-src');
const OUT_DIR = join(ROOT, 'public', 'data');

/** Quantidade de livros do Antigo Testamento (Gênesis..Malaquias). */
const AT_BOOKS = 39;
/** Total esperado de livros (canônico protestante). */
const TOTAL_BOOKS = 66;

/**
 * Quantidade canônica de capítulos por livro (ordem canônica, 66 valores).
 * Soma: AT = 929, NT = 260, total = 1189.
 * Usada para detectar/truncar capítulos espúrios na fonte
 * (ex.: NTLH traz 2 Samuel com 38 capítulos em vez de 24).
 */
const CANONICAL_CHAPTERS = [
  // AT (39)
  50, 40, 27, 36, 34, 24, 21, 4, 31, 24, // Gn..2Sm
  22, 25, 29, 36, 10, 13, 10, 42, 150, 31, // 1Rs..Pv
  12, 8, 66, 52, 5, 48, 12, 14, 3, 9, // Ec..Am
  1, 4, 7, 3, 3, 3, 2, 14, 4, // Ob..Ml
  // NT (27)
  28, 16, 24, 21, 28, 16, 16, 13, 6, 6, // Mt..Ef
  4, 4, 5, 3, 6, 4, 3, 1, 13, 5, // Ph..Tg
  5, 3, 5, 1, 1, 1, 22, // 1Pd..Ap
];

function fail(file, message) {
  console.error(`\n❌ ${file}: ${message}`);
  process.exit(1);
}

function formatBytes(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------
// 1. Preparar diretório de saída
// ---------------------------------------------------------------
mkdirSync(OUT_DIR, { recursive: true });

const files = readdirSync(SRC_DIR)
  .filter((f) => f.toLowerCase().endsWith('.json'))
  .sort();

if (files.length === 0) {
  console.error('❌ Nenhum arquivo .json encontrado em data-src/');
  process.exit(1);
}

console.log(`📂 Origem: ${SRC_DIR}`);
console.log(`📂 Destino: ${OUT_DIR}`);
console.log(`📄 ${files.length} arquivo(s) encontrado(s)\n`);

// ---------------------------------------------------------------
// 2. Converter cada arquivo
// ---------------------------------------------------------------
let totalBooksOut = 0;
let totalChaptersOut = 0;
let totalVersesOut = 0;
let totalBytesIn = 0;
let totalBytesOut = 0;
const summary = [];

for (const file of files) {
  const srcPath = join(SRC_DIR, file);
  const outPath = join(OUT_DIR, file);

  // --- Ler e parsear (UTF-8 explícito) ---
  let raw;
  try {
    raw = readFileSync(srcPath, 'utf8');
  } catch (e) {
    fail(file, `falha ao ler arquivo: ${e.message}`);
  }

  let books;
  try {
    books = JSON.parse(raw);
  } catch (e) {
    fail(file, `JSON inválido: ${e.message}`);
  }

  // --- Validações estruturais da entrada ---
  if (!Array.isArray(books)) {
    fail(file, 'estrutura raiz não é um array');
  }
  if (books.length !== TOTAL_BOOKS) {
    fail(file, `esperava ${TOTAL_BOOKS} livros, encontrado(s): ${books.length}`);
  }
  if (CANONICAL_CHAPTERS.length !== TOTAL_BOOKS) {
    fail(file, `CANONICAL_CHAPTERS tem ${CANONICAL_CHAPTERS.length} itens, esperado ${TOTAL_BOOKS}`);
  }

  const warnings = [];

  // --- Validação estrutural de todos os livros (antes de qualquer transformação) ---
  books.forEach((book, i) => {
    if (!book || typeof book !== 'object') {
      fail(file, `livro no índice ${i} não é um objeto`);
    }
    if (typeof book.name !== 'string' || book.name.length === 0) {
      fail(file, `livro no índice ${i} sem campo "name"`);
    }
    if (typeof book.abbrev !== 'string' || book.abbrev.length === 0) {
      fail(file, `livro "${book.name}" sem campo "abbrev"`);
    }
    if (!Array.isArray(book.chapters)) {
      fail(file, `livro "${book.name}": "chapters" não é um array`);
    }
    book.chapters.forEach((verses, ci) => {
      if (!Array.isArray(verses)) {
        fail(file, `livro "${book.name}" capítulo ${ci + 1}: não é um array de versículos`);
      }
      verses.forEach((text, vi) => {
        if (typeof text !== 'string') {
          fail(
            file,
            `livro "${book.name}" ${ci + 1}:${vi + 1}: texto não é string (tipo: ${typeof text})`
          );
        }
      });
    });
  });

  // Seleção de capítulos a manter (trunca espúrios) + conferência de versículos.
  const chaptersToKeep = books.map((book, i) => {
    const actual = book.chapters.length;
    const canonical = CANONICAL_CHAPTERS[i];
    if (actual > canonical) {
      warnings.push(
        `"${book.name}": ${actual} capítulos (canônico ${canonical}) — removendo ${actual - canonical} espúrio(s)`
      );
      return book.chapters.slice(0, canonical);
    }
    if (actual < canonical) {
      warnings.push(
        `"${book.name}": ${actual} capítulos (canônico ${canonical}) — mantendo como está (fonte incompleta)`
      );
    }
    return book.chapters;
  });

  const versesBefore = chaptersToKeep.reduce(
    (sum, bookChapters) => sum + bookChapters.reduce((s, ch) => s + ch.length, 0),
    0
  );

  // --- Transformar ---
  const converted = books.map((book, i) => {
    return {
      id: i + 1,
      name: book.name,
      abbreviation: book.abbrev,
      testament: i < AT_BOOKS ? 'AT' : 'NT',
      chapters: chaptersToKeep[i].map((verses, ci) => ({
        chapter: ci + 1,
        verses: verses.map((text, vi) => ({ verse: vi + 1, text: text.trim() })),
      })),
    };
  });

  // --- Validação: nada pode se perder na conversão ---
  const versesAfter = converted.reduce(
    (s, b) => s + b.chapters.reduce((s2, c) => s2 + c.verses.length, 0),
    0
  );
  if (versesBefore !== versesAfter) {
    fail(file, `contagem de versículos mudou: antes=${versesBefore}, depois=${versesAfter}`);
  }

  // --- Gravar saída compacta (UTF-8) ---
  const outJson = JSON.stringify(converted);
  try {
    writeFileSync(outPath, outJson, 'utf8');
  } catch (e) {
    fail(file, `falha ao gravar saída: ${e.message}`);
  }

  // --- Verificar que o arquivo gravado é JSON válido ---
  try {
    JSON.parse(readFileSync(outPath, 'utf8'));
  } catch (e) {
    fail(file, `arquivo de saída ficou inválido: ${e.message}`);
  }

  const chaptersOut = converted.reduce((s, b) => s + b.chapters.length, 0);
  const bytesIn = Buffer.byteLength(raw, 'utf8');
  const bytesOut = Buffer.byteLength(outJson, 'utf8');

  for (const w of warnings) {
    console.warn(`  ⚠️  ${file}: ${w}`);
  }

  totalBooksOut += converted.length;
  totalChaptersOut += chaptersOut;
  totalVersesOut += versesAfter;
  totalBytesIn += bytesIn;
  totalBytesOut += bytesOut;

  summary.push({ file, books: converted.length, chapters: chaptersOut, verses: versesAfter, bytesIn, bytesOut });
}

// ---------------------------------------------------------------
// 3. Relatório
// ---------------------------------------------------------------
console.log('✅ Conversão concluída:\n');
console.log(
  '  Arquivo'.padEnd(16) +
    'Livros'.padStart(7) +
    'Capítulos'.padStart(11) +
    'Versículos'.padStart(12) +
    'Entrada'.padStart(10) +
    'Saída'.padStart(10)
);
console.log('  ' + '-'.repeat(62));

for (const s of summary) {
  console.log(
    `  ${s.file}`.padEnd(16) +
      String(s.books).padStart(7) +
      String(s.chapters).padStart(11) +
      String(s.verses).padStart(12) +
      formatBytes(s.bytesIn).padStart(10) +
      formatBytes(s.bytesOut).padStart(10)
  );
}

console.log('  ' + '-'.repeat(62));
console.log(
  `  ${'TOTAL'.padEnd(14)}` +
    String(totalBooksOut).padStart(7) +
    String(totalChaptersOut).padStart(11) +
    String(totalVersesOut).padStart(12) +
    formatBytes(totalBytesIn).padStart(10) +
    formatBytes(totalBytesOut).padStart(10)
);

console.log(`\n🎯 ${files.length} tradução(ões) convertida(s) → ${OUT_DIR}`);
console.log('   Amostras para conferência manual:');
console.log('   - Gn 1:1 ("No princípio...")');
console.log('   - Jo 3:16 ("Porque Deus amou o mundo...")');
console.log('   - Fronteira AT/NT: livro 39 = Malaquias (AT), livro 40 = Mateus (NT)');
