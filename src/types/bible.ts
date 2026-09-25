// Tipos do domínio bíblico
// Espelham o formato de public/data/*.json (saída de scripts/convert-bible-data.mjs)

export interface Verse {
  verse: number;
  text: string;
}

export interface Chapter {
  chapter: number;
  verses: Verse[];
}

export interface Book {
  id: number;
  name: string;
  abbreviation: string;
  testament: 'AT' | 'NT';
  chapters: Chapter[];
}
