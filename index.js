'use strict';

const hymns = {
  en: require('./languages/en/hymns.json'),
  es: require('./languages/es/himnos.json'),
  fr: require('./languages/fr/cantiques.json'),
};

const crosswalk = require('./crosswalk.json');

const languages = Object.keys(hymns);

const GOSPEL_LIBRARY = {
  en: 'eng',
  es: 'spa',
  fr: 'fra',
};

const BOOK_PATHS = {
  hymns: 'https://www.churchofjesuschrist.org/study/manual/hymns/',
  'hymns-for-home-and-church': 'https://www.churchofjesuschrist.org/study/music/hymns-for-home-and-church/',
};

let entriesByLang;

// lang → Map(hymn id → crosswalk entry), built on first use.
function entryFor(id, lang) {
  if (!entriesByLang) {
    entriesByLang = Object.fromEntries(languages.map((l) => [l, new Map()]));
    for (const entry of crosswalk) {
      for (const l of languages) {
        if (entry[l]) entriesByLang[l].set(entry[l], entry);
      }
    }
  }
  return entriesByLang[lang].get(String(id));
}

function table(lang) {
  const data = hymns[lang];
  if (!data) {
    throw new RangeError(`Unknown language "${lang}". Available: ${languages.join(', ')}`);
  }
  return data;
}

// Lowercase and strip accents/punctuation so "senor" matches "Señor" and "tis" matches "'Tis".
function normalize(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Most ids are plain numbers ("30"); a few hymnbooks print lettered variants ("127a", "127b").
function toHymn(id, title) {
  return { id, number: parseInt(id, 10), title };
}

function byNumber(a, b) {
  return a.number - b.number || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

function getHymn(id, lang = 'en') {
  const key = String(id);
  const title = table(lang)[key];
  return title === undefined ? null : toHymn(key, title);
}

// Sort explicitly: JS objects list integer-like keys before others, which would push "127a" after "1210".
function list(lang = 'en') {
  return Object.entries(table(lang))
    .map(([id, title]) => toHymn(id, title))
    .sort(byNumber);
}

function search(query, lang = 'en') {
  const needle = normalize(String(query));
  if (!needle) return [];
  return list(lang).filter((hymn) => normalize(hymn.title).includes(needle));
}

// The same hymn in another language. A note explains when the tune or arrangement differs.
function translate(id, from, to) {
  table(from);
  table(to);
  const entry = entryFor(id, from);
  if (!entry || !entry[to]) return null;
  const hymn = getHymn(entry[to], to);
  const note = entry.notes?.[to] ?? entry.notes?.[from];
  return note ? { ...hymn, note } : hymn;
}

// The hymn's page on churchofjesuschrist.org, with lyrics, sheet music and recordings.
function url(id, lang = 'en') {
  table(lang);
  const entry = entryFor(id, lang);
  if (!entry) return null;
  const page = entry.pages?.[lang] ?? entry.id;
  return `${BOOK_PATHS[entry.book]}${page}?lang=${GOSPEL_LIBRARY[lang]}`;
}

module.exports = { hymns, crosswalk, languages, getHymn, list, search, translate, url };
