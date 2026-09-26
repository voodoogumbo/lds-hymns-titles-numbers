export type Language = 'en' | 'es' | 'fr';

export interface Hymn {
  /** The number as printed, e.g. "30", or "127a" for a lettered variant. */
  id: string;
  /** Numeric part of the id, e.g. 127 for "127a". */
  number: number;
  title: string;
}

export type Book = 'hymns' | 'hymns-for-home-and-church';

/** One hymn across languages. A language is null when its hymnbook doesn't include the hymn. */
export interface CrosswalkEntry {
  /** The Church's page id for the hymn, e.g. "the-morning-breaks". */
  id: string;
  /** "hymns" for the current hymnbooks (1985 / 1992 / 1993), or the new hymnbook. */
  book: Book;
  en: string | null;
  es: string | null;
  fr: string | null;
  /** Page id for a language whose version lives on a different page (another tune or arrangement). */
  pages?: Partial<Record<Language, string>>;
  /** How a language's version differs, e.g. "Different tune (HARRISON)." */
  notes?: Partial<Record<Language, string>>;
}

/** Raw data: hymn id → title, per language. */
export const hymns: Record<Language, Record<string, string>>;

/** Every hymn, with its number in each language. */
export const crosswalk: CrosswalkEntry[];

export const languages: Language[];

/** Look up a hymn by number or id ("127a"). Returns null if it isn't in that language's data. */
export function getHymn(id: number | string, lang?: Language): Hymn | null;

/** All hymns for a language, in numeric order. */
export function list(lang?: Language): Hymn[];

/** Case-, accent- and punctuation-insensitive substring search on titles. */
export function search(query: string, lang?: Language): Hymn[];

/**
 * The same hymn in another language, or null if that hymnbook doesn't have it.
 * `note` is set when the other version uses a different tune or arrangement.
 */
export function translate(id: number | string, from: Language, to: Language): (Hymn & { note?: string }) | null;

/** The hymn's page on churchofjesuschrist.org (lyrics, sheet music, recordings), or null if unknown. */
export function url(id: number | string, lang?: Language): string | null;
