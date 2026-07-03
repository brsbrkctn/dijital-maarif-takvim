# Changelog

All notable changes to the **Dijital Maarif Takvimi** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2026-07-04

### Fixed & Enhanced
- **Ankara Default & Stale Cache Reset**: Added auto-cache clearing (`maarif_ver: 2.2.0`) to reset stale browser `localStorage`. Set default location to Ankara (`39.9334, 32.8597`), ensuring instant accurate Ankara prayer times and weather.
- **Date Header Redesign**: Removed confusing Rûmî header date to prevent month mismatch confusion. Replaced with clear badges (`Miladî: 4 Temmuz 2026 Cumartesi` | `Hicrî: 17 Muharrem 1448`).
- **Date Plaque Layout**: Built a dedicated centered Date Plaque frame (`.date-plaque`) with dashed border and letter-spacing offsets.
- **Multi-Event Bullet List**: Verified all items in `olaylar` array render as bulleted HTML lists (`<ul class="history-list">`).

## [2.1.0] - 2026-07-04

### Fixed & Enhanced
- **Reverse Geocoding & Precise Ankara Location**: Added reverse geocoding API integration. GPS/IP now accurately resolves to user's city (Ankara), delivering exact Ankara Diyanet prayer times and Open-Meteo weather.
- **Multi-Event History List**: Formatted all items in `olaylar` array as clean HTML bulleted lists (`<ul class="history-list">`), displaying all 3 historical events instead of clipping to 1.
- **Mathematical Date Centering**: Added negative margin offsets matching letter-spacing to ensure `TEMMUZ`, day number `4`, and `CUMARTESİ` are 100% mathematically centered.
- **Git Repo Ready**: Initialized git repository with main branch and configured origin `https://github.com/brsbrkctn/dijital-maarif-takvim.git`.

## [2.0.0] - 2026-07-04

### Major Redesign (Modern & Nostalgic Hybrid)
- **New Visual Identity**: Complete overhaul of the interface to a sleek, modern dark-slate and champagne gold hybrid design, moving away from direct paper calendar copycat styles.
- **Header Badges**: Clarified Hijri, Miladî, and Rûmî calendar dates with explicit badges to eliminate any date confusion.
- **Prayer Times Precision**: Corrected Turkish Diyanet prayer mappings (İmsak set to Fajr, Güneş to Sunrise, Dhuhr to Öğle, Asr to İkindi, Maghrib to Akşam, Isha to Yatsı) with live countdown timer to the next prayer time.
- **Auto Location Engine**: Added automatic GPS & IP location detection on startup with one-click manual location override.
- **Typography & Flexbox Layout**: Completely rebuilt date hero component with Outfit + Playfair Display typography, eliminating all text overlap.

## [1.0.3] - 2026-07-04

### Fixed & Added
- **Typography & Overlap Fix**: Completely restructured central date hero layout (`TEMMUZ`, day number `4`, `CUMARTESİ`) using flexbox gaps and strict `line-height: 1` to eliminate text collision.
- **Prayer Times Precision**: Fixed Aladhan API call parameters to send explicit `DD-MM-YYYY` local date string and exact latitude/longitude, ensuring precise Diyanet-aligned prayer times.
- **Auto Location (GPS/IP)**: Added automatic GPS/IP location detection on startup with manual city override fallback in settings.
- **Distinct Design Identity**: Refined visual styling to create a unique "Dijital Nezaket & Masa Takvimi" look without copycat issues.

## [1.0.2] - 2026-07-04

### Fixed & Enhanced
- Enhanced vintage printing press styling with parchment gradient textures and double borders.
- Added dotted line leaders and clear typography hierarchy across prayer times and weather cards.
- Added overflow scroll protection to historical events (`history-card`) to ensure multi-line events fit cleanly without pushing layout.
- Cleaned up lingering temporary scratch files.

## [1.0.1] - 2026-07-04

### Changed
- Relocated project workspace to `D:\Antigravity\dijital-maarif-takvimi`.
- Integrated user-provided 365-day `data.json` dataset.
- Added support for multi-line historical events (`olaylar`), quote author parsing (`ozlu_soz`), and gender-specific name suggestions (`isim_onerileri`).

## [1.0.0] - 2026-07-04

### Added
- Authentic vintage "Saatli Maarif Takvimi" layout with parchment texture, double border, and star patterns.
- Open-Meteo API integration for real-time Turkish weather forecasts.
- Aladhan API integration for Diyanet-aligned prayer times and Hijri calendar calculation.
- Rûmî Calendar date calculation and Hızır/Kasım seasonal day counters.
- Local JSON loader (`data/daily_data.json`) for daily quotes, historical events, and baby name recommendations with smart fallbacks.
- Pixel-shifting AMOLED/LCD screen burn-in protection engine (1-2px shift every 60s).
- Fullscreen mode and city selection settings modal.
- Vercel zero-config static site deployment support.
