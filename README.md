# LDS Hymns Titles and Numbers

Hymn numbers and titles from the hymnbooks of The Church of Jesus Christ of Latter-day Saints, in English, Spanish and French, as plain JSON with a tiny zero-dependency JavaScript helper.

**Data current through the July 23, 2026 release of *Hymns—For Home and Church*.**

## What's included

| Language | File | Legacy hymnbook | *Hymns—For Home and Church* | Total |
|---|---|---|---|---|
| English (`en`) | [`languages/en/hymns.json`](languages/en/hymns.json) | *Hymns* (1985), 1–341 | 1001–1072, 1201–1210 | 423 |
| Spanish (`es`) | [`languages/es/himnos.json`](languages/es/himnos.json) | *Himnos* (1992), 1–209 | 1001–1072, 1201–1210 | 291 |
| French (`fr`) | [`languages/fr/cantiques.json`](languages/fr/cantiques.json) | *Cantiques* (1993), 1–204 | 1001–1072, 1201–1210 | 288 |

### About the numbering

- **1–341 / 1–209 / 1–204** are the numbers in the current printed hymnbooks. They differ between languages. Hymn 2 is "The Spirit of God" in all three, but most numbers don't line up.
- *Cantiques* prints two versions of hymns 127 and 151, numbered **127a/127b** and **151a/151b**. There is no plain 127 or 151 in French.
- **1001+ and 1201+** are songs from the new *Hymns—For Home and Church* (Spanish: *Himnos para el hogar y la Iglesia*; French: *Cantiques pour le foyer et l'église*), which the Church is releasing digitally in batches. These numbers **are** the same in every language. They start at 1001 and 1201 so the existing hymnbooks can keep their numbering in the meantime.
- The Church expects the complete new hymnbook, about 375 songs, in print and digital in 2027, with *"the same song list and numbering across all languages."* The final numbering hasn't been published. Expect the 1001/1201 numbers to change when it is, and this dataset will follow.

## Data format

Each file is a JSON object mapping the hymn number (as a string, occasionally with a letter such as `"127a"`) to its official title, in numeric order:

```json
{
  "1": "The Morning Breaks",
  "2": "The Spirit of God",
  "1001": "Come, Thou Fount of Every Blessing",
  "1201": "Hail the Day That Sees Him Rise"
}
```

Titles use straight apostrophes (`'`) and ordinary spaces, where the Church's site uses curly apostrophes (`’`) and, in French, non-breaking spaces before `!` and `?`. Other punctuation (`¿`, `¡`, `« »`) is kept as published.

If you read the JSON in JavaScript, note that `Object.keys` lists whole-number keys before keys like `"127a"`. Use `list()` for correct order.

## Usage

### Install

The package isn't on npm yet. Install it from GitHub:

```bash
npm install github:voodoogumbo/lds-hymns-titles-numbers
```

Or skip installing and fetch the JSON directly:

```
https://raw.githubusercontent.com/voodoogumbo/lds-hymns-titles-numbers/main/languages/en/hymns.json
https://raw.githubusercontent.com/voodoogumbo/lds-hymns-titles-numbers/main/languages/es/himnos.json
https://raw.githubusercontent.com/voodoogumbo/lds-hymns-titles-numbers/main/languages/fr/cantiques.json
```

### JavaScript / Node.js

```js
const { getHymn, list, search } = require('lds-hymns-titles-numbers');

getHymn(1);              // { id: '1', number: 1, title: 'The Morning Breaks' }
getHymn(1064, 'es');     // { id: '1064', number: 1064, title: 'Fiel eres Tú, mi Dios' }
getHymn('127a', 'fr');   // { id: '127a', number: 127, title: 'Douce nuit! Sainte nuit!' }
search('amazing grace'); // [{ id: '1010', number: 1010, title: 'Amazing Grace' }]
search('etiez vous', 'fr'); // ignores case, accents and punctuation
list('en');              // every English hymn, in numeric order

// Or use the raw data
const en = require('lds-hymns-titles-numbers/en');
en['30']; // 'Come, Come, Ye Saints'
```

TypeScript types are included.

### Python

```python
import json

with open('languages/en/hymns.json', encoding='utf-8') as f:
    hymns = json.load(f)

print(hymns['1'])  # The Morning Breaks
```

## Contributing

Corrections and new languages are welcome.

- **A title is wrong, or a new batch was released:** open an issue or PR with a link to the hymn on [churchofjesuschrist.org](https://www.churchofjesuschrist.org/media/music/collections/hymns-for-home-and-church).
- **Adding a language:** create `languages/<ISO 639-1 code>/<name>.json` in the same format, register it in [`index.js`](index.js) and [`index.d.ts`](index.d.ts), and add a row to the table above. Portuguese (`pt`) is the most useful next, since it's among the first languages of the new hymnbook.
- Run `npm test` before submitting. It checks that numbers are valid, unique and ordered, that titles are clean, and that every 1000+ number also exists in English.

## Sources

Titles and numbers come from the Church's Gospel Library: [*Hymns*](https://www.churchofjesuschrist.org/study/manual/hymns?lang=eng), [*Himnos*](https://www.churchofjesuschrist.org/study/manual/hymns?lang=spa), [*Cantiques*](https://www.churchofjesuschrist.org/study/manual/hymns?lang=fra), and [*Hymns—For Home and Church*](https://www.churchofjesuschrist.org/study/music/hymns-for-home-and-church?lang=eng). Release schedule details: [New Hymnbook](https://www.churchofjesuschrist.org/initiative/new-hymns?lang=eng).

## License

The code and the compilation of this data are available under the [MIT License](LICENSE). Hymn titles and hymnbooks belong to Intellectual Reserve, Inc. This is an unofficial project and is not affiliated with or endorsed by The Church of Jesus Christ of Latter-day Saints.
