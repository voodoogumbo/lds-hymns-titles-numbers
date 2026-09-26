'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { hymns, languages, getHymn, list, search } = require('..');

const files = {
  en: 'languages/en/hymns.json',
  es: 'languages/es/himnos.json',
  fr: 'languages/fr/cantiques.json',
};

for (const lang of languages) {
  const file = path.join(__dirname, '..', files[lang]);

  test(`${lang}: keys are unique hymn numbers in ascending order`, () => {
    // JSON.parse silently keeps the last duplicate key, so compare against the raw key list.
    const rawKeys = [...fs.readFileSync(file, 'utf8').matchAll(/^\s*"([^"]+)":/gm)].map((m) => m[1]);
    assert.equal(rawKeys.length, Object.keys(hymns[lang]).length, 'duplicate keys in JSON');

    // A number may carry a letter when a hymnbook prints two versions of one hymn ("127a", "127b").
    for (const key of rawKeys) {
      assert.match(key, /^[1-9]\d*[a-z]?$/, `bad hymn number "${key}"`);
    }
    const sortKey = (key) => [parseInt(key, 10), key.replace(/^\d+/, '')];
    for (let i = 1; i < rawKeys.length; i++) {
      const [a, aSuffix] = sortKey(rawKeys[i - 1]);
      const [b, bSuffix] = sortKey(rawKeys[i]);
      assert.ok(b > a || (b === a && bSuffix > aSuffix), `${rawKeys[i]} is out of order after ${rawKeys[i - 1]}`);
    }
    for (const key of rawKeys.filter((k) => /[a-z]$/.test(k))) {
      assert.ok(!(parseInt(key, 10) in hymns[lang]), `${key} coexists with an unlettered ${parseInt(key, 10)}`);
    }
  });

  test(`${lang}: titles are non-empty and trimmed`, () => {
    for (const [number, title] of Object.entries(hymns[lang])) {
      assert.equal(typeof title, 'string', `#${number}`);
      assert.ok(title.length > 0, `#${number} is empty`);
      assert.equal(title, title.trim(), `#${number} has surrounding whitespace`);
      assert.doesNotMatch(title, /\s{2,}/, `#${number} has repeated whitespace`);
      assert.doesNotMatch(title, /[\u2018\u2019\u00a0\u202f]/, `#${number} has a curly apostrophe or non-breaking space`);
    }
  });
}

test('new-hymnbook numbers (1000+) in every language also exist in English', () => {
  for (const lang of languages) {
    for (const number of Object.keys(hymns[lang])) {
      if (Number(number) >= 1000) {
        assert.ok(number in hymns.en, `${lang} #${number} has no English counterpart`);
      }
    }
  }
});

test('getHymn', () => {
  assert.deepEqual(getHymn(1), { id: '1', number: 1, title: 'The Morning Breaks' });
  assert.deepEqual(getHymn('2', 'es'), { id: '2', number: 2, title: 'El Espíritu de Dios' });
  assert.deepEqual(getHymn('127b', 'fr'), { id: '127b', number: 127, title: 'Douce nuit! Sainte nuit!' });
  assert.equal(getHymn(127, 'fr'), null);
  assert.equal(getHymn(9999), null);
  assert.throws(() => getHymn(1, 'xx'), RangeError);
});

test('list is in numeric order, with lettered variants in place', () => {
  for (const lang of languages) {
    const numbers = list(lang).map((h) => h.number);
    assert.deepEqual(numbers, [...numbers].sort((a, b) => a - b), lang);
  }
  const ids = list('fr').map((h) => h.id);
  assert.deepEqual(ids.slice(ids.indexOf('126'), ids.indexOf('128') + 1), ['126', '127a', '127b', '128']);
});

test('search ignores case, accents and punctuation', () => {
  assert.ok(search('amazing grace').some((h) => h.number === 1010));
  assert.ok(search('espiritu de dios', 'es').some((h) => h.number === 2));
  assert.ok(search('tis sweet').length >= 1);
  assert.ok(search('etiez vous la', 'fr').some((h) => h.number === 1206));
  assert.deepEqual(search('   '), []);
});
