// Constantes de configuração do app (valores de runtime, não tipos)
import type { AppSettings, Speed } from '../types';
import { DEFAULT_TRANSLATION_CODE } from '../data/bibleData';

export const SPEED_OPTIONS: Speed[] = [100, 200, 300, 400, 500, 600, 800, 1000];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  spritzMode: false,
  speed: 300,
  fontSize: 48,
  translation: DEFAULT_TRANSLATION_CODE, // ARA
};
