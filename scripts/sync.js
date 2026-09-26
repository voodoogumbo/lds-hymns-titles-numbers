#!/usr/bin/env node
'use strict';

// Rebuilds languages/*/*.json and crosswalk.json from the Church's Gospel Library.
//
//   npm run sync           rewrite the data files
//   npm run sync -- --check  exit 1 if the published data differs from the files
//
// Titles come from each book's table of contents (which includes labels such as
// "(Women)"); numbers come from each hymn's own page. Requires Node 18+.

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const API = 'https://www.churchofjesuschrist.org/study/api/v3/language-pages/type/content';

const LANGUAGES = {
  en: { api: 'eng', file: 'languages/en/hymns.json' },
  es: { api: 'spa', file: 'languages/es/himnos.json' },
  fr: { api: 'fra', file: 'languages/fr/cantiques.json' },
  pt: { api: 'por', file: 'languages/pt/hinos.json' },
};

const BOOKS = {
  hymns: '/manual/hymns',
  'hymns-for-home-and-church': '/music/hymns-for-home-and-church',
};

// A few pages don't print their number. These are confirmed by the Church's
// "About the Hymns" pages (/study/manual/sacred-music-gospel-study-resource-pilot/1031-…, /1041-…).
const KNOWN_NUMBERS = {
  'come-hear-the-word-the-lord-has-spoken': '1031',
  'o-lord-who-gave-thy-life-for-me': '1041',
};

// Legacy-hymnbook pages that set the same text as another language's page, but under a
// different page id because the tune or arrangement differs. Checked against each page's text credit.
const LINKS = [
  { lang: 'es', page: 'go-ye-messengers-of-heaven', to: 'go-ye-messengers-of-heaven-mens-choir', note: "Congregational arrangement (the English is for men's choir)." },
  { lang: 'es', page: 'god-of-our-fathers-known-of-old-woodbury', to: 'god-of-our-fathers-known-of-old', note: 'Different tune (WOODBURY).' },
  { lang: 'es', page: 'guide-us-o-thou-great-jehovah-harrison', to: 'guide-us-o-thou-great-jehovah', note: 'Different tune (HARRISON).' },
  { lang: 'es', page: 'brightly-beams-our-fathers-mercy-men', to: 'brightly-beams-our-fathers-mercy-mens-choir' },
  { lang: 'fr', page: 'when-faith-endures-mozart', to: 'when-faith-endures', note: 'Different tune (Mozart).' },
  { lang: 'fr', page: 'brightly-beams-our-fathers-mercy', to: 'brightly-beams-our-fathers-mercy-mens-choir', note: "Congregational arrangement (the English is for men's choir)." },
  { lang: 'pt', page: 'angry-words-o-let-them-never', to: 'angry-words-oh-let-them-never' },
];

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decode(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (entity, name) => {
    if (name[0] === '#') {
      return String.fromCodePoint(name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : Number(name.slice(1)));
    }
    if (!(name in ENTITIES)) throw new Error(`Unhandled HTML entity ${entity}`);
    return ENTITIES[name];
  });
}

// Match the dataset's conventions: straight apostrophes, ordinary spaces.
function cleanTitle(html) {
  return decode(html.replace(/<[^>]+>/g, ''))
    .replace(/[‘’]/g, "'")
    .replace(/[  ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function getPage(lang, uri) {
  const url = `${API}?lang=${lang}&uri=${encodeURIComponent(uri)}`;
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'lds-hymns-titles-numbers sync' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()).content.body;
    } catch (err) {
      if (attempt === 4) throw new Error(`${url}: ${err.message}`);
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

// → [{ page, number, title }] for one book in one language.
async function fetchBook(lang, book) {
  const root = BOOKS[book];
  const toc = await getPage(lang, root);
  const links = new RegExp(`href="/study${root}/([^"?#]+)[^"]*"[^>]*>([\\s\\S]*?)</a>`, 'g');
  const entries = [...toc.matchAll(links)].map(([, page, title]) => ({ page, title: cleanTitle(title) }));
  if (entries.length === 0) throw new Error(`No hymns found in ${lang} ${root}`);

  return mapLimit(entries, 4, async (entry) => {
    const body = await getPage(lang, `${root}/${entry.page}`);
    const match = body.match(/class="song-number"[^>]*>([^<]*)</);
    const number = match ? match[1].trim() : KNOWN_NUMBERS[entry.page];
    if (!/^[1-9]\d*[a-z]?$/.test(number || '')) {
      throw new Error(`No usable number for ${lang} ${root}/${entry.page} (got "${number}")`);
    }
    return { ...entry, number };
  });
}

function byNumber(a, b) {
  return parseInt(a, 10) - parseInt(b, 10) || (a < b ? -1 : a > b ? 1 : 0);
}

// Written by hand because JSON.stringify would move "127a" after every whole-number key.
function serializeLanguageFile(rows) {
  const sorted = [...rows].sort((a, b) => byNumber(a.number, b.number));
  sorted.forEach((row, i) => {
    if (i > 0 && row.number === sorted[i - 1].number) throw new Error(`Duplicate hymn number ${row.number}`);
  });
  const lines = sorted.map(({ number, title }) => `  ${JSON.stringify(number)}: ${JSON.stringify(title)}`);
  return `{\n${lines.join(',\n')}\n}\n`;
}

function buildCrosswalk(books) {
  const crosswalk = [];
  for (const book of Object.keys(BOOKS)) {
    const entries = new Map(); // page id → entry
    const entryFor = (id) => {
      if (!entries.has(id)) entries.set(id, { id, book, ...Object.fromEntries(Object.keys(LANGUAGES).map((l) => [l, null])) });
      return entries.get(id);
    };
    for (const lang of Object.keys(LANGUAGES)) {
      for (const row of books[lang][book]) {
        const link = book === 'hymns' && LINKS.find((l) => l.lang === lang && l.page === row.page);
        const entry = entryFor(link ? link.to : row.page);
        if (entry[lang]) throw new Error(`${lang} ${row.page} collides with ${lang} ${entry[lang]} in ${entry.id}`);
        entry[lang] = row.number;
        if (link) {
          entry.pages = { ...entry.pages, [lang]: row.page };
          if (link.note) entry.notes = { ...entry.notes, [lang]: link.note };
        }
      }
    }
    for (const link of LINKS) {
      if (book === 'hymns' && !entries.get(link.to)?.[link.lang]) throw new Error(`Link ${link.lang} ${link.page} was not applied`);
    }
    // Order by English number, then by the next language's number for entries missing earlier languages.
    const sortKey = (e) => {
      const i = Object.keys(LANGUAGES).findIndex((l) => e[l]);
      return [i, e[Object.keys(LANGUAGES)[i]]];
    };
    crosswalk.push(
      ...[...entries.values()].sort((a, b) => {
        const [ga, na] = sortKey(a);
        const [gb, nb] = sortKey(b);
        return ga - gb || byNumber(na, nb);
      }),
    );
  }
  return crosswalk;
}

// One crosswalk entry per line keeps diffs readable.
function serializeCrosswalk(entries) {
  return `[\n${entries.map((e) => `  ${JSON.stringify(e)}`).join(',\n')}\n]\n`;
}

async function main() {
  const check = process.argv.includes('--check');
  const books = {};
  for (const [lang, { api }] of Object.entries(LANGUAGES)) {
    books[lang] = {};
    for (const book of Object.keys(BOOKS)) {
      books[lang][book] = await fetchBook(api, book);
      console.error(`${lang} ${book}: ${books[lang][book].length} hymns`);
    }
  }

  const outputs = {};
  for (const [lang, { file }] of Object.entries(LANGUAGES)) {
    outputs[file] = serializeLanguageFile([...books[lang].hymns, ...books[lang]['hymns-for-home-and-church']]);
  }
  const crosswalk = buildCrosswalk(books);
  outputs['crosswalk.json'] = serializeCrosswalk(crosswalk);

  // A hymn only one non-English book has is usually real, but can be a tune variant that needs a LINKS entry.
  // (The English book is the largest, so English-only hymns are expected.)
  const langs = Object.keys(LANGUAGES).filter((l) => l !== 'en');
  const singles = crosswalk.filter((e) => e.book === 'hymns' && !e.en && langs.filter((l) => e[l]).length === 1);
  console.error(`Only in one non-English hymnbook: ${singles.map((e) => langs.map((l) => e[l] && `${l} ${e[l]}`).find(Boolean)).join(', ')}`);

  const changed = Object.keys(outputs).filter((file) => {
    const target = path.join(ROOT, file);
    return !fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== outputs[file];
  });

  if (check) {
    if (changed.length) {
      console.error(`Out of date: ${changed.join(', ')}. Run \`npm run sync\`.`);
      process.exitCode = 1;
    } else {
      console.error('Data is up to date.');
    }
    return;
  }
  for (const file of changed) {
    fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, file), outputs[file]);
  }
  console.error(changed.length ? `Updated: ${changed.join(', ')}` : 'Data is up to date.');
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
