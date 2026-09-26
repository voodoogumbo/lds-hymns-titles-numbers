# LDS Hymns: Titles and Numbers

[![test](https://github.com/voodoogumbo/lds-hymns-titles-numbers/actions/workflows/test.yml/badge.svg)](https://github.com/voodoogumbo/lds-hymns-titles-numbers/actions/workflows/test.yml)
[![check for new hymns](https://github.com/voodoogumbo/lds-hymns-titles-numbers/actions/workflows/check-for-new-hymns.yml/badge.svg)](https://github.com/voodoogumbo/lds-hymns-titles-numbers/actions/workflows/check-for-new-hymns.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Every hymn number and title from the hymnbooks of The Church of Jesus Christ of Latter-day Saints, in **English, Spanish, French and Portuguese**, plus a **cross-reference** that tells you what number a hymn is in each language.

Plain JSON you can use from any language, and a tiny zero-dependency JavaScript API.

**🔎 Just need a number? Use the [Hymn Number Finder](https://voodoogumbo.github.io/lds-hymns-titles-numbers/).** Type a number or title and see the hymn in all four languages, with links to the sheet music.

**Up to date with the July 23, 2026 release of *Hymns—For Home and Church*.** A weekly job checks for new releases.

## Why this exists

Hymn numbers are different in every language's hymnbook. The four books share 151 hymns, and only the first three of them have the same number in every language:

| Hymn | English | Spanish | French | Portuguese |
|---|---|---|---|---|
| We Thank Thee, O God, for a Prophet | 19 | 10 | 10 | 9 |
| Come, Come, Ye Saints | 30 | 17 | 18 | 20 |
| How Firm a Foundation | 85 | 40 | 42 | 42 |
| I Know That My Redeemer Lives | 136 | 73 | 73 | 70 |
| God Be with You Till We Meet Again | 152 | 89 | 89 | 85 |

So if you're printing a bilingual program, leading music in a multilingual ward, or building an app, you need a lookup table. This is that table, built directly from the Church's Gospel Library.

## Quick start

```bash
npm install github:voodoogumbo/lds-hymns-titles-numbers
```

```js
const { getHymn, translate, search, url } = require('lds-hymns-titles-numbers');

getHymn(136);
// { id: '136', number: 136, title: 'I Know That My Redeemer Lives' }

translate(136, 'en', 'es');
// { id: '73', number: 73, title: 'Yo sé que vive mi Señor' }

translate(83, 'en', 'es');
// { id: '39', number: 39, title: 'Jehová, sé nuestro guía', note: 'Different tune (HARRISON).' }

search('redeemer lives');
// [{ id: '135', … 'My Redeemer Lives' }, { id: '136', … 'I Know That My Redeemer Lives' }]

url(73, 'es');
// 'https://www.churchofjesuschrist.org/study/manual/hymns/i-know-that-my-redeemer-lives?lang=spa'
```

Not using JavaScript? Download the JSON directly. See [Using the data without JavaScript](#using-the-data-without-javascript).

## What's included

| Language | File | Current hymnbook | *Hymns—For Home and Church* | Total |
|---|---|---|---|---|
| English (`en`) | [`languages/en/hymns.json`](languages/en/hymns.json) | *Hymns* (1985), 1–341 | 1001–1072, 1201–1210 | 423 |
| Spanish (`es`) | [`languages/es/himnos.json`](languages/es/himnos.json) | *Himnos*, 1–209 | 1001–1072, 1201–1210 | 291 |
| French (`fr`) | [`languages/fr/cantiques.json`](languages/fr/cantiques.json) | *Cantiques*, 1–204 | 1001–1072, 1201–1210 | 288 |
| Portuguese (`pt`) | [`languages/pt/hinos.json`](languages/pt/hinos.json) | *Hinos*, 1–204 | 1001–1072, 1201–1210 | 286 |

Plus [`crosswalk.json`](crosswalk.json), which lines up all of these across languages.

The other hymnbooks are smaller than the English one. Of the 341 English hymns, 197 are in *Himnos*, 198 in *Cantiques* and 192 in *Hinos*. Each also has hymns the English book doesn't: 12 in Spanish, 12 in Portuguese and 7 in French (not counting French 127b, the Swiss version of "Silent Night").

### How the numbering works

- **Current hymnbooks (1–341, 1–209, 1–204, 1–204).** Each language numbers its own book, so numbers don't match across languages. Use `translate()` or the crosswalk.
- **Voice labels.** Hymns arranged for women's or men's voices keep the label from the hymnbook's contents, e.g. "As Sisters in Zion (Women)" or "Nous, sœurs de Sion (voix de femmes)".
- **Lettered numbers.** *Cantiques* prints two versions each of hymns 127 and 151. They're numbered `127a`/`127b` and `151a`/`151b`, and there is no plain 127 or 151 in French.
- ***Hymns—For Home and Church* (1001+ and 1201+).** The Church is releasing the new hymnbook digitally in batches (Spanish: *Himnos para el hogar y la Iglesia*; French: *Cantiques pour le foyer et l'église*; Portuguese: *Hinos para o Lar e para a Igreja*). These numbers **are** the same in every language. They start at 1001 and 1201 so the current books can keep their numbers in the meantime.
- **What's coming.** The Church expects the complete new hymnbook, about 375 songs, in print and digital in 2027, with *"the same song list and numbering across all languages."* The final numbers haven't been published. Expect 1001+/1201+ to change then, and this dataset will follow.

## JavaScript API

| Function | Returns |
|---|---|
| `getHymn(id, lang = 'en')` | The hymn with that number (`136` or `'127a'`), or `null` |
| `list(lang = 'en')` | Every hymn in numeric order |
| `search(query, lang = 'en')` | Hymns whose title contains `query`, ignoring case, accents and punctuation (`'senor'` finds "Señor") |
| `translate(id, from, to)` | The same hymn in another language, or `null` if that hymnbook doesn't have it. Includes a `note` when the tune or arrangement differs |
| `url(id, lang = 'en')` | The hymn's page on churchofjesuschrist.org, with lyrics, sheet music and recordings |
| `hymns`, `crosswalk`, `languages` | The raw data |

Hymns are returned as `{ id, number, title }`. `id` is the number as printed (`'127a'`). `number` is its numeric part (`127`). TypeScript types are included.

You can also import a single data file: `require('lds-hymns-titles-numbers/es')`, `/en`, `/fr`, `/pt` or `/crosswalk`.

## Data format

### Language files

A JSON object mapping each hymn number to its title, in numeric order:

```json
{
  "1": "The Morning Breaks",
  "2": "The Spirit of God",
  "1001": "Come, Thou Fount of Every Blessing",
  "1201": "Hail the Day That Sees Him Rise"
}
```

Titles match the Church's hymnbook contents, with two changes: straight apostrophes (`'`) instead of curly ones, and ordinary spaces where French uses non-breaking spaces before `!` and `?`.

If you read the files in JavaScript, `Object.keys()` puts whole-number keys before keys like `"127a"`. Use `list()` for the correct order.

### Crosswalk

[`crosswalk.json`](crosswalk.json) has one entry per hymn, with its number in each language, or `null` where that language's hymnbook doesn't include it:

```json
{"id":"i-know-that-my-redeemer-lives","book":"hymns","en":"136","es":"73","fr":"73","pt":"70"}
{"id":"guide-us-o-thou-great-jehovah","book":"hymns","en":"83","es":"39","fr":"39","pt":"40",
 "pages":{"es":"guide-us-o-thou-great-jehovah-harrison"},"notes":{"es":"Different tune (HARRISON)."}}
{"id":"behold-the-lamb-of-god","book":"hymns","en":null,"es":"59","fr":null,"pt":null}
```

| Field | Meaning |
|---|---|
| `id` | The Church's page id for the hymn. Also the last part of its Gospel Library URL |
| `book` | `"hymns"` for the current hymnbooks, `"hymns-for-home-and-church"` for the new one |
| `en`, `es`, `fr`, `pt` | The hymn's number in each language, or `null` |
| `pages` | *(Optional)* A different page id for a language whose version is published separately, usually because of a different tune or arrangement |
| `notes` | *(Optional)* How that language's version differs |

Hymns are matched by the Church's own page ids, which are the same in every language. In six hymns, one language's version is on a different page, usually because its tune or arrangement differs. Those were matched by comparing the text credits on each page, and they're listed in `LINKS` in [`scripts/sync.js`](scripts/sync.js).

## Using the data without JavaScript

Every file is available at a permanent URL:

```
https://raw.githubusercontent.com/voodoogumbo/lds-hymns-titles-numbers/main/languages/en/hymns.json
https://raw.githubusercontent.com/voodoogumbo/lds-hymns-titles-numbers/main/languages/es/himnos.json
https://raw.githubusercontent.com/voodoogumbo/lds-hymns-titles-numbers/main/languages/fr/cantiques.json
https://raw.githubusercontent.com/voodoogumbo/lds-hymns-titles-numbers/main/languages/pt/hinos.json
https://raw.githubusercontent.com/voodoogumbo/lds-hymns-titles-numbers/main/crosswalk.json
```

For example, in Python:

```python
import json, urllib.request

BASE = "https://raw.githubusercontent.com/voodoogumbo/lds-hymns-titles-numbers/main/"
load = lambda path: json.load(urllib.request.urlopen(BASE + path))

english, spanish = load("languages/en/hymns.json"), load("languages/es/himnos.json")
crosswalk = load("crosswalk.json")

entry = next(e for e in crosswalk if e["en"] == "136")
print(english[entry["en"]], "→", entry["es"], spanish[entry["es"]])
# I Know That My Redeemer Lives → 73 Yo sé que vive mi Señor
```

## Website

[`site/index.html`](site/index.html) is the [Hymn Number Finder](https://voodoogumbo.github.io/lds-hymns-titles-numbers/). It's a single static page with no build step. A [workflow](.github/workflows/pages.yml) publishes it to GitHub Pages, along with the data files, on every push to `main`. Searches are kept in the URL, so a lookup can be shared, e.g. [`#136`](https://voodoogumbo.github.io/lds-hymns-titles-numbers/#136).

To preview it locally, serve the page next to the data:

```bash
mkdir -p /tmp/site && cp -R site/. languages crosswalk.json /tmp/site/ && python3 -m http.server -d /tmp/site
```

## Keeping the data current

All data files are generated by [`scripts/sync.js`](scripts/sync.js). It reads every hymnbook's contents and every hymn page from the Church's Gospel Library, about 1,400 pages, and takes a minute or so.

```bash
npm run sync              # regenerate the data files
npm run sync -- --check   # just report whether anything changed
npm test                  # validate the data and the API
```

A [weekly GitHub Action](.github/workflows/check-for-new-hymns.yml) runs the sync and opens an issue when the Church publishes changes, such as a new batch of hymns.

## Contributing

Contributions are welcome, especially new languages.

- **Found a wrong title or number?** Check it against [churchofjesuschrist.org](https://www.churchofjesuschrist.org/media/music/collections/hymns-for-home-and-church) and [open an issue](https://github.com/voodoogumbo/lds-hymns-titles-numbers/issues). The data is generated by the sync script, so fixes belong in the script, not in hand edits to the JSON.
- **Adding a language:**
  - add it to `LANGUAGES` in [`scripts/sync.js`](scripts/sync.js), using the Gospel Library's three-letter code (e.g. `deu` for German);
  - add it to [`index.js`](index.js), [`index.d.ts`](index.d.ts) and the `LANGS` list in [`site/index.html`](site/index.html);
  - run `npm run sync` and `npm test`;
  - check whether any of its hymns need an entry in `LINKS`: sync lists the hymns it found in only one non-English hymnbook, and each is worth a second look.
- Please run `npm test` before opening a pull request.

## Sources

Everything comes from the Church's Gospel Library:
- **Current hymnbooks:** [*Hymns*](https://www.churchofjesuschrist.org/study/manual/hymns?lang=eng), [*Himnos*](https://www.churchofjesuschrist.org/study/manual/hymns?lang=spa), [*Cantiques*](https://www.churchofjesuschrist.org/study/manual/hymns?lang=fra) and [*Hinos*](https://www.churchofjesuschrist.org/study/manual/hymns?lang=por).
- **New hymnbook:** [*Hymns—For Home and Church*](https://www.churchofjesuschrist.org/study/music/hymns-for-home-and-church?lang=eng).
- **Release plans:** the Church's [New Hymnbook](https://www.churchofjesuschrist.org/initiative/new-hymns?lang=eng) page.

## License

The code and the compilation of this data are available under the [MIT License](LICENSE). Hymn titles and hymnbooks belong to Intellectual Reserve, Inc. This is an unofficial project and is not affiliated with or endorsed by The Church of Jesus Christ of Latter-day Saints.
