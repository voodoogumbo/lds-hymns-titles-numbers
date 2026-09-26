export type Language = 'en' | 'es' | 'fr';

export interface Hymn {
  /** The number as printed, e.g. "30", or "127a" for a lettered variant. */
  id: string;
  /** Numeric part of the id, e.g. 127 for "127a". */
  number: number;
  title: string;
}

/** Raw data: hymn id → title, per language. */
export const hymns: Record<Language, Record<string, string>>;

export const languages: Language[];

/** Look up a hymn by number or id ("127a"). Returns null if it isn't in that language's data. */
export function getHymn(id: number | string, lang?: Language): Hymn | null;

/** All hymns for a language, in numeric order. */
export function list(lang?: Language): Hymn[];

/** Case-, accent- and punctuation-insensitive substring search on titles. */
export function search(query: string, lang?: Language): Hymn[];
