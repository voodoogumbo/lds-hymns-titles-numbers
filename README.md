# LDS Hymns Titles and Numbers

A multilingual database of The Church of Jesus Christ of Latter-day Saints hymn titles and numbers.

## Overview

This repository provides hymn titles and their corresponding numbers from LDS hymnals in multiple languages. Each language contains the complete hymnal with both standard hymns and supplemental songs.

## Languages Available

- **English** (`/languages/en/hymns.json`) - 402 hymns
- **Spanish** (`/languages/es/himnos.json`) - 269 hymns

## Structure

```
languages/
├── en/
│   └── hymns.json
├── es/
│   └── himnos.json
├── fr/
└── pt/
```

## Data Format

Each JSON file contains hymn numbers as keys and titles as values:

```json
{
  "1": "The Morning Breaks",
  "2": "The Spirit of God",
  "30": "Come, Come, Ye Saints",
  "1001": "Come, Thou Fount of Every Blessing"
}
```

## Usage

Perfect for:
- Building hymn selection applications
- Creating digital hymnals
- Cross-referencing hymns between languages
- Worship service planning tools

## Contributing

We welcome contributions of additional languages! Please follow the existing JSON structure and submit a pull request.

## Future Languages

We hope to add more languages including:
- French
- Portuguese
- And others as available

## License

This data is provided for educational and religious purposes.