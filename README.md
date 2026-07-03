# Dijital Maarif Takvimi (Nostalgic Digital Maarif Calendar)

A single-page, vintage-style digital calendar web application inspired by traditional Turkish "Saatli Maarif Takvimi". Designed for tabletop Android tablets, iPads, and desktop displays with responsive viewport scaling, real-time prayer times, weather forecasts, local JSON dataset integration, and AMOLED/LCD burn-in protection.

## Features

- **Vintage Visual Design**: Authentic press layout with parchment paper aesthetics, star borders, and classic typography (Playfair Display & Merriweather fonts).
- **Live Weather Integration**: Free Open-Meteo API integration with automatic weather descriptions translated into classic terminology.
- **Prayer Times & Hijri Calendar**: Aladhan API integration tuned to Diyanet İşleri Başkanlığı calculation method. Features real-time active prayer highlighting and remaining daylight/nighttime calculations.
- **Traditional Turkish Maarif Calendar Logic**:
  - Hijri Date display
  - Rûmî Calendar date calculation
  - Hızır vs. Kasım seasonal day counters
  - Day lengthening/shortening indicators
- **Local Data Engine (`data/daily_data.json`)**:
  - On this day in history (*Tarihte Bugün*)
  - Daily wisdom & quotes (*Günün Sözü*)
  - Baby name suggestions & meanings (*Kız ve Erkek Çocuk İsmi Önerileri*)
  - Smart fallback content generator for missing dates.
- **Burn-In Protection (Pixel Shift Engine)**: Automatically shifts screen pixels by 1-2px every 60 seconds to prevent screen burn-in during 24/7 tabletop usage.
- **Fullscreen & City Controls**: Interactive gear menu to switch cities or toggle fullscreen mode.

## Project Structure

```
.
├── index.html            # Main single-page web app
├── css/
│   └── style.css         # Vintage design tokens, responsive grid & typography
├── js/
│   ├── app.js            # Clock animations, calendar logic & burn-in engine
│   ├── api.js            # Open-Meteo & Aladhan API services
│   └── data-store.js     # Local JSON file reader & fallback generator
├── data/
│   └── daily_data.json   # Customizable daily JSON dataset
├── package.json          # Deployment & server scripts
├── CHANGELOG.md          # Version history
└── README.md             # Documentation
```

## How to Customize Daily JSON Data

You can add your own daily content by opening `data/daily_data.json` and adding entries indexed by `MM-DD`:

```json
{
  "07-04": {
    "history": "1932 — Türkiye, Milletler Cemiyeti'ne katılma davetini kabul etti.",
    "quote": "Hayatta en hakiki mürşit ilimdir, fendir.",
    "quote_author": "Mustafa Kemal Atatürk",
    "name_male": "Kaan",
    "name_male_desc": "hükümdar, hanların hanı",
    "name_female": "Defne",
    "name_female_desc": "güzel kokulu bitki"
  }
}
```

## Deployment to Vercel

1. Create a repository on GitHub and push this directory.
2. Log into [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Keep the default settings and click **Deploy**.
5. Open the deployed URL on your tablet browser and select **Fullscreen Mode**.

## License

This project is open-source under the [MIT License](LICENSE).
