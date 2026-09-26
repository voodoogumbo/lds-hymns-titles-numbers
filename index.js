'use strict';

const hymns = {
  en: require('./languages/en/hymns.json'),
  es: require('./languages/es/himnos.json'),
  fr: require('./languages/fr/cantiques.json'),
};

const languages = Object.keys(hymns);

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

module.exports = { hymns, languages, getHymn, list, search };
