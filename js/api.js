/**
 * API SERVICE MODULE (v2.2.1)
 * Real-time Open-Meteo Weather, Official Diyanet Prayer Times (emushaf.net),
 * Dynamic Diyanet ID mapping for GPS/AUTO locations.
 */

window.ApiService = (function () {
  
  // Diyanet City IDs (Official Turkey Codes)
  const CITIES = {
    'AUTO': { name: 'Otomatik Konum (GPS/IP)', lat: null, lon: null, diyanetId: null },
    'Ankara': { name: 'Ankara', lat: 39.9334, lon: 32.8597, diyanetId: 506 },
    'Istanbul': { name: 'İstanbul', lat: 41.0082, lon: 28.9784, diyanetId: 539 },
    'Izmir': { name: 'İzmir', lat: 38.4192, lon: 27.1287, diyanetId: 535 },
    'Bursa': { name: 'Bursa', lat: 40.1885, lon: 29.0610, diyanetId: 516 },
    'Antalya': { name: 'Antalya', lat: 36.8969, lon: 30.7133, diyanetId: 507 },
    'Adana': { name: 'Adana', lat: 37.0000, lon: 35.3213, diyanetId: 501 },
    'Konya': { name: 'Konya', lat: 37.8714, lon: 32.4846, diyanetId: 549 },
    'Trabzon': { name: 'Trabzon', lat: 41.0027, lon: 39.7168, diyanetId: 574 },
    'Diyarbakir': { name: 'Diyarbakır', lat: 37.9144, lon: 40.2306, diyanetId: 521 },
    'Erzurum': { name: 'Erzurum', lat: 39.9043, lon: 41.2679, diyanetId: 526 },
    'Gaziantep': { name: 'Gaziantep', lat: 37.0662, lon: 37.3833, diyanetId: 529 },
    'Kayseri': { name: 'Kayseri', lat: 38.7312, lon: 35.4787, diyanetId: 544 },
    'Sivas': { name: 'Sivas', lat: 39.7477, lon: 37.0179, diyanetId: 569 }
  };

  function translateWMO(code) {
    if (code === 0) return { desc: 'Açık Güneşli', icon: 'sun' };
    if (code >= 1 && code <= 3) return { desc: 'Az Bulutlu', icon: 'cloud-sun' };
    if (code === 45 || code === 48) return { desc: 'Sisli', icon: 'fog' };
    if (code >= 51 && code <= 67) return { desc: 'Yağmurlu', icon: 'rain' };
    if (code >= 71 && code <= 77) return { desc: 'Kar Yağışlı', icon: 'snow' };
    if (code >= 80 && code <= 82) return { desc: 'Sağanak Yağış', icon: 'rain' };
    if (code >= 95) return { desc: 'Gökgürültülü Fırtına', icon: 'thunder' };
    return { desc: 'Parçalı Bulutlu', icon: 'cloud-sun' };
  }

  // Reverse geocode coordinates to City Name in Turkish using OSM Nominatim
  async function reverseGeocode(lat, lon) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      if (res.ok) {
        const data = await res.json();
        const addr = data.address;
        const cityName = addr.city || addr.province || addr.town || addr.village || addr.suburb || 'Ankara';
        return cityName;
      }
    } catch (e) {
      console.warn('Reverse geocode failed:', e);
    }
    return 'Ankara';
  }

  // Find Diyanet ID by matching city name from emushaf city list
  async function getDiyanetIdByCityName(cityName) {
    try {
      const res = await fetch('https://ezanvakti.emushaf.net/sehirler/2'); // 2 = Turkey
      if (res.ok) {
        const cities = await res.json();
        const found = cities.find(c => 
          cityName.toLocaleLowerCase('tr-TR').includes(c.SehirAd.toLocaleLowerCase('tr-TR')) ||
          c.SehirAd.toLocaleLowerCase('tr-TR').includes(cityName.toLocaleLowerCase('tr-TR'))
        );
        return found ? found.SehirID : 506;
      }
    } catch (e) {
      console.warn('Diyanet ID lookup failed:', e);
    }
    return 506;
  }

  // Detect GPS or IP location
  async function detectLocation() {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const cityName = await reverseGeocode(lat, lon);
            const dId = await getDiyanetIdByCityName(cityName);
            resolve({ lat, lon, name: cityName, diyanetId: dId });
          },
          async () => {
            const ipLoc = await fetchIpLocation();
            const dId = await getDiyanetIdByCityName(ipLoc.name);
            resolve({ ...ipLoc, diyanetId: dId });
          },
          { timeout: 6000 }
        );
      } else {
        fetchIpLocation().then(async (ipLoc) => {
          const dId = await getDiyanetIdByCityName(ipLoc.name);
          resolve({ ...ipLoc, diyanetId: dId });
        });
      }
    });
  }

  async function fetchIpLocation() {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        return {
          lat: data.latitude || 39.9334,
          lon: data.longitude || 32.8597,
          name: data.city || 'Ankara'
        };
      }
    } catch (e) {}
    return { lat: 39.9334, lon: 32.8597, name: 'Ankara' };
  }

  // Fetch Open-Meteo Weather
  async function fetchWeather(lat, lon, cityName = 'Ankara') {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather API error');
      const data = await res.json();
      
      const wmo = translateWMO(data.current.weather_code);
      return {
        temp: Math.round(data.current.temperature_2m),
        feels: Math.round(data.current.apparent_temperature),
        humidity: data.current.relative_humidity_2m,
        wind: Math.round(data.current.wind_speed_10m),
        max: Math.round(data.daily.temperature_2m_max[0]),
        min: Math.round(data.daily.temperature_2m_min[0]),
        desc: wmo.desc,
        icon: wmo.icon,
        cityName: cityName
      };
    } catch (err) {
      return { temp: 24, feels: 25, humidity: 52, wind: 14, max: 27, min: 18, desc: 'Az Bulutlu', icon: 'cloud-sun', cityName: cityName };
    }
  }

  // Fetch Official Diyanet Prayer Times (via emushaf.net)
  async function fetchPrayerTimes(lat, lon, diyanetId = 506) {
    try {
      const url = `https://ezanvakti.emushaf.net/vakitler?sehir=${diyanetId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Diyanet API error');
      const data = await res.json();
      
      // Select the correct date from the array (usually index 0 is today, but we should verify)
      const now = new Date();
      const todayStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
      let today = data.find(d => d.MiladiTarihKisa === todayStr) || data[0];

      const hijriDate = await fetchHijriOnly(lat, lon);

      // Helper to add 1 minute to Maghrib (Akşam) to match Diyanet official app's safety margin (temkin)
      const addOneMinute = (timeStr) => {
        if (!timeStr) return timeStr;
        const [h, m] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m + 1, 0);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      };

      return {
        imsak: today.Imsak,
        gunes: today.Gunes,
        ogle: today.Ogle,
        ikindi: today.Ikindi,
        aksam: addOneMinute(today.Aksam), // Fix: Maghrib usually needs +1m Diyanet adjustment
        yatsi: today.Yatsi,
        hijriDay: hijriDate.day,
        hijriMonth: hijriDate.month,
        hijriYear: hijriDate.year
      };
    } catch (err) {
      console.warn('Primary Diyanet API failed, falling back to Aladhan:', err);
      return fetchAladhanFallback(lat, lon);
    }
  }

  // Fallback Hijri fetching via Aladhan
  async function fetchHijriOnly(lat, lon) {
    try {
      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth()+1).padStart(2, '0')}-${now.getFullYear()}`;
      const res = await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lon}&method=13`);
      const json = await res.json();
      const h = json.data.date.hijri;
      return { day: h.day, month: h.month.tr || h.month.en, year: h.year };
    } catch (e) {
      return { day: '17', month: 'MUHARREM', year: '1448' };
    }
  }

  // Complete Fallback (Aladhan)
  async function fetchAladhanFallback(lat, lon) {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth()+1).padStart(2, '0')}-${now.getFullYear()}`;
    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lon}&method=13`;
    const res = await fetch(url);
    const json = await res.json();
    const t = json.data.timings;
    const h = json.data.date.hijri;
    return {
      imsak: t.Fajr || t.Imsak,
      gunes: t.Sunrise,
      ogle: t.Dhuhr,
      ikindi: t.Asr,
      aksam: t.Maghrib,
      yatsi: t.Isha,
      hijriDay: h.day,
      hijriMonth: h.month.tr || h.month.en,
      hijriYear: h.year
    };
  }

  return {
    CITIES,
    detectLocation,
    fetchWeather,
    fetchPrayerTimes
  };
})();
