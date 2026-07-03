/**
 * MAIN APP ORCHESTRATOR — v2.4.0
 * Handles clock animations, countdown banner, prayer time status badges,
 * full-word daylight/night durations, Open-Meteo weather, and Ankara default.
 */

document.addEventListener('DOMContentLoaded', () => {

  // Force clean stale localStorage on v2.4.0 update
  if (localStorage.getItem('maarif_ver') !== '2.4.0') {
    localStorage.removeItem('maarif_city');
    localStorage.setItem('maarif_ver', '2.4.0');
  }

  // State (Default city: Ankara)
  let currentCity = localStorage.getItem('maarif_city') || 'Ankara';
  let burninEnabled = localStorage.getItem('maarif_burnin') !== 'false';
  let prayerData = null;
  let weatherData = null;

  // DOM Elements
  const appRoot = document.getElementById('app-root');
  const analogClock = document.getElementById('analog-clock');
  const hourHand = document.getElementById('hour-hand');
  const minuteHand = document.getElementById('minute-hand');
  const secondHand = document.getElementById('second-hand');
  const digitalClockTime = document.getElementById('digital-clock-time');
  
  // Header DOM Elements
  const badgeHijri = document.getElementById('badge-hijri');
  const labelCurrentLocation = document.getElementById('label-current-location');
  const dayLengthChange = document.getElementById('day-length-change');

  // Subheader DOM Elements
  const infoYear = document.getElementById('info-year');

  // Center Hero DOM Elements
  const mainMonthName = document.getElementById('main-month-name');
  const mainDayNumber = document.getElementById('main-day-number');
  const mainDayName = document.getElementById('main-day-name');
  const mainSeasonNote = document.getElementById('main-season-note');

  // Weather DOM Elements
  const weatherCityLabel = document.getElementById('weather-city-label');
  const weatherTemp = document.getElementById('weather-temp');
  const weatherDesc = document.getElementById('weather-desc');
  const wFeels = document.getElementById('w-feels');
  const wMax = document.getElementById('w-max');
  const wMin = document.getElementById('w-min');
  const wHumidity = document.getElementById('w-humidity');

  // Content DOM Elements
  const historyContent = document.getElementById('history-content');
  const quoteContent = document.getElementById('quote-content');
  const quoteAuthor = document.getElementById('quote-author');
  const nameMale = document.getElementById('name-male');
  const nameFemale = document.getElementById('name-female');

  // Countdown Banner DOM Elements
  const nextPrayerName = document.getElementById('next-prayer-name');
  const nextPrayerTimer = document.getElementById('next-prayer-timer');
  const dayDuration = document.getElementById('day-duration');
  const nightDuration = document.getElementById('night-duration');

  // Settings DOM Elements
  const modal = document.getElementById('settings-modal');
  const btnOpenSettings = document.getElementById('btn-open-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const btnLocationSelect = document.getElementById('btn-location-select');
  const btnToggleFullscreen = document.getElementById('btn-toggle-fullscreen');
  const btnModalFullscreen = document.getElementById('btn-modal-fullscreen');
  const selectCity = document.getElementById('select-city');
  const burninToggle = document.getElementById('burnin-toggle');
  const burninBadge = document.getElementById('burnin-status-badge');

  // Month Names in Turkish
  const TURKISH_MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const TURKISH_DAYS = [
    'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'
  ];

  // --- 1. CLOCK ENGINE ---
  function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Analog Clock Hands Rotation
    const secDeg = (seconds / 60) * 360;
    const minDeg = ((minutes + seconds / 60) / 60) * 360;
    const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;

    secondHand.setAttribute('transform', `rotate(${secDeg} 50 50)`);
    minuteHand.setAttribute('transform', `rotate(${minDeg} 50 50)`);
    hourHand.setAttribute('transform', `rotate(${hourDeg} 50 50)`);

    // Digital Time Format
    const hStr = String(hours).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');
    digitalClockTime.textContent = `${hStr}:${mStr}:${sStr}`;

    if (prayerData) {
      updatePrayerState(hours, minutes, seconds);
    }
  }

  // --- 2. CALENDAR CALCULATIONS ---
  function updateDateFields() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const date = now.getDate();
    const dayOfWeek = now.getDay();

    // Center Plaque
    mainMonthName.textContent = TURKISH_MONTHS[month].toUpperCase();
    mainDayNumber.textContent = date;
    mainDayName.textContent = TURKISH_DAYS[dayOfWeek].toUpperCase();
    infoYear.textContent = year;

    // Day of Year
    const startOfYear = new Date(year, 0, 0);
    const diff = now - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;

    // Traditional Hızır vs. Kasım Counter
    const hizirStart = new Date(year, 4, 6); // May 6
    const kasimStart = new Date(year, 10, 8); // Nov 8

    if (now >= hizirStart && now < kasimStart) {
      const count = Math.floor((now - hizirStart) / oneDay) + 1;
      mainSeasonNote.textContent = `☀️ Yaz Mevsimi (Hızır Günleri: ${count}. Gün)`;
    } else {
      let count = 0;
      if (now >= kasimStart) {
        count = Math.floor((now - kasimStart) / oneDay) + 1;
      } else {
        const prevKasim = new Date(year - 1, 10, 8);
        count = Math.floor((now - prevKasim) / oneDay) + 1;
      }
      mainSeasonNote.textContent = `❄️ Kış Mevsimi (Kasım Günleri: ${count}. Gün)`;
    }

    // Solstices: June 21 to Dec 21
    const summerSolstice = new Date(year, 5, 21);
    const winterSolstice = new Date(year, 11, 21);

    if (now >= summerSolstice && now < winterSolstice) {
      dayLengthChange.textContent = '📉 Günler 1-2 dakika kısalıyor';
    } else {
      dayLengthChange.textContent = '📈 Günler 1-2 dakika uzuyor';
    }
  }

  // --- 3. PRAYER TIMES HIGHLIGHT & COUNTDOWN BANNER ---
  function updatePrayerState(h, m, s) {
    const currentMins = h * 60 + m;
    const currentSecsTotal = h * 3600 + m * 60 + s;

    function timeToMins(tStr) {
      if (!tStr) return 0;
      const [ph, pm] = tStr.split(':').map(Number);
      return ph * 60 + pm;
    }

    const prayerTimesMins = [
      { key: 'imsak', name: 'İmsak', mins: timeToMins(prayerData.imsak) },
      { key: 'gunes', name: 'Güneş', mins: timeToMins(prayerData.gunes) },
      { key: 'ogle', name: 'Öğle', mins: timeToMins(prayerData.ogle) },
      { key: 'ikindi', name: 'İkindi', mins: timeToMins(prayerData.ikindi) },
      { key: 'aksam', name: 'Akşam', mins: timeToMins(prayerData.aksam) },
      { key: 'yatsi', name: 'Yatsı', mins: timeToMins(prayerData.yatsi) }
    ];

    let activeIndex = 5; // default Yatsı
    let nextPrayer = prayerTimesMins[0];

    for (let i = 0; i < prayerTimesMins.length; i++) {
      const curr = prayerTimesMins[i];
      const next = prayerTimesMins[(i + 1) % prayerTimesMins.length];
      if (currentMins >= curr.mins && (i === prayerTimesMins.length - 1 || currentMins < next.mins)) {
        activeIndex = i;
        nextPrayer = next;
        break;
      }
    }

    // Update prayer row badges and active status
    document.querySelectorAll('.prayer-row').forEach((el, idx) => {
      const badge = el.querySelector('.p-status-badge');

      if (idx === activeIndex) {
        el.classList.add('active');
        if (badge) badge.textContent = 'AKTİF VAKİT';
      } else {
        el.classList.remove('active');
        if (badge) {
          if (idx < activeIndex) {
            badge.textContent = 'Geçti';
          } else {
            badge.textContent = 'Girecek';
          }
        }
      }
    });

    // Calculate countdown to next prayer
    let targetSecs = nextPrayer.mins * 60;
    if (targetSecs <= currentSecsTotal) {
      targetSecs += 24 * 3600;
    }
    const diffSecs = targetSecs - currentSecsTotal;
    const cdH = Math.floor(diffSecs / 3600);
    const cdM = Math.floor((diffSecs % 3600) / 60);
    const cdS = diffSecs % 60;

    const cdHStr = String(cdH).padStart(2, '0');
    const cdMStr = String(cdM).padStart(2, '0');
    const cdSStr = String(cdS).padStart(2, '0');

    if (nextPrayerName) nextPrayerName.textContent = nextPrayer.name;
    if (nextPrayerTimer) nextPrayerTimer.textContent = `${cdHStr}:${cdMStr}:${cdSStr}`;

    // Calculate Day/Night Duration (Sunrise to Sunset) in FULL WORDS
    const dayLengthMins = prayerTimesMins[4].mins - prayerTimesMins[1].mins; // Akşam - Güneş
    const nightLengthMins = (24 * 60) - dayLengthMins;

    const dH = Math.floor(dayLengthMins / 60);
    const dM = dayLengthMins % 60;
    const nH = Math.floor(nightLengthMins / 60);
    const nM = nightLengthMins % 60;

    dayDuration.textContent = `Gündüz Süresi: ${dH} Saat ${dM} Dakika`;
    nightDuration.textContent = `Gece Süresi: ${nH} Saat ${nM} Dakika`;
  }

  // --- 4. LOAD API & LOCAL DATA ---
  async function loadAllData() {
    const now = new Date();
    let lat = 39.9334; // Default Ankara
    let lon = 32.8597;
    let cityName = 'Ankara';

    if (currentCity === 'AUTO') {
      const loc = await window.ApiService.detectLocation();
      lat = loc.lat;
      lon = loc.lon;
      cityName = loc.name;
    } else if (window.ApiService.CITIES[currentCity]) {
      const c = window.ApiService.CITIES[currentCity];
      lat = c.lat;
      lon = c.lon;
      cityName = c.name;
    }
    
    labelCurrentLocation.textContent = `${cityName}`;
    weatherCityLabel.textContent = cityName;

    // Load Weather
    weatherData = await window.ApiService.fetchWeather(lat, lon, cityName);
    weatherTemp.textContent = `${weatherData.temp}°C`;
    weatherDesc.textContent = weatherData.desc;
    wFeels.textContent = `${weatherData.feels}°C`;
    wMax.textContent = `${weatherData.max}°C`;
    wMin.textContent = `${weatherData.min}°C`;
    wHumidity.textContent = `%${weatherData.humidity} / ${weatherData.wind} km/s`;

    // Load Prayer & Hijri with exact lat/lon
    prayerData = await window.ApiService.fetchPrayerTimes(lat, lon);
    document.getElementById('time-imsak').textContent = prayerData.imsak;
    document.getElementById('time-gunes').textContent = prayerData.gunes;
    document.getElementById('time-ogle').textContent = prayerData.ogle;
    document.getElementById('time-ikindi').textContent = prayerData.ikindi;
    document.getElementById('time-aksam').textContent = prayerData.aksam;
    document.getElementById('time-yatsi').textContent = prayerData.yatsi;

    badgeHijri.textContent = `${prayerData.hijriDay} ${prayerData.hijriMonth} ${prayerData.hijriYear}`;

    // Load Local JSON Content
    const content = await window.DataStore.getDailyContent(now.getMonth() + 1, now.getDate());
    historyContent.innerHTML = content.history;
    quoteContent.textContent = content.quote ? `"${content.quote}"` : "";
    quoteAuthor.textContent = content.quote_author ? `— ${content.quote_author}` : '';
    nameMale.textContent = content.name_male_desc ? `${content.name_male} (${content.name_male_desc})` : content.name_male;
    nameFemale.textContent = content.name_female_desc ? `${content.name_female} (${content.name_female_desc})` : content.name_female;
  }

  // --- 5. BURN-IN PROTECTION ---
  function startPixelShift() {
    setInterval(() => {
      if (!burninEnabled) {
        appRoot.style.transform = 'translate(0px, 0px)';
        return;
      }
      const dx = (Math.floor(Math.random() * 5) - 2);
      const dy = (Math.floor(Math.random() * 5) - 2);
      appRoot.style.transform = `translate(${dx}px, ${dy}px)`;
    }, 60000);
  }

  // --- 6. SETTINGS & EVENT LISTENERS ---
  selectCity.value = currentCity;
  burninToggle.checked = burninEnabled;
  updateBurninBadge();

  function updateBurninBadge() {
    burninBadge.style.display = burninEnabled ? 'inline-block' : 'none';
  }

  btnOpenSettings.addEventListener('click', () => modal.classList.remove('hidden'));
  btnLocationSelect.addEventListener('click', () => modal.classList.remove('hidden'));
  btnCloseSettings.addEventListener('click', () => modal.classList.add('hidden'));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  selectCity.addEventListener('change', (e) => {
    currentCity = e.target.value;
    localStorage.setItem('maarif_city', currentCity);
    loadAllData();
  });

  burninToggle.addEventListener('change', (e) => {
    burninEnabled = e.target.checked;
    localStorage.setItem('maarif_burnin', burninEnabled);
    updateBurninBadge();
    if (!burninEnabled) appRoot.style.transform = 'translate(0px, 0px)';
  });

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen request denied:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  btnToggleFullscreen.addEventListener('click', toggleFullscreen);
  btnModalFullscreen.addEventListener('click', () => {
    toggleFullscreen();
    modal.classList.add('hidden');
  });

  // --- INITIALIZATION ---
  updateDateFields();
  updateClock();
  setInterval(updateClock, 1000);
  
  loadAllData();
  startPixelShift();

  setInterval(loadAllData, 30 * 60 * 1000);
});
