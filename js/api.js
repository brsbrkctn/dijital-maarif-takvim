/**
 * API SERVICE MODULE (v2.1.0)
 * Real-time Open-Meteo Weather, Aladhan Prayer Times (Exact Date + Lat/Lon),
 * Reverse Geocoding for GPS location detection, and city coordinate mappings.
 */

window.ApiService = (function () {
  
  // Major Turkish Cities Map
  const CITIES = {
    'AUTO': { name: 'Otomatik Konum (GPS/IP)', lat: null, lon: null },
    'Ankara': { name: 'Ankara', lat: 39.9334, lon: 32.8597 },
    'Istanbul': { name: 'İstanbul', lat: 41.0082, lon: 28.9784 },
    'Izmir': { name: 'İzmir', lat: 38.4192, lon: 27.1287 },
    'Bursa': { name: 'Bursa', lat: 40.1885, lon: 29.0610 },
    'Antalya': { name: 'Antalya', lat: 36.8969, lon: 30.7133 },
    'Adana': { name: 'Adana', lat: 37.0000, lon: 35.3213 },
    'Konya': { name: 'Konya', lat: 37.8714, lon: 32.4846 },
    'Trabzon': { name: 'Trabzon', lat: 41.0027, lon: 39.7168 },
    'Diyarbakir': { name: 'Diyarbakır', lat: 37.9144, lon: 40.2306 },
    'Erzurum': { name: 'Erzurum', lat: 39.9043, lon: 41.2679 },
    'Gaziantep': { name: 'Gaziantep', lat: 37.0662, lon: 37.3833 },
    'Kayseri': { name: 'Kayseri', lat: 38.7312, lon: 35.4787 },
    'Sivas': { name: 'Sivas', lat: 39.7477, lon: 37.0179 }
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
        const cityName = addr.city || addr.province || addr.town || addr.village || addr.suburb || 'Mevcut Konum';
        return cityName;
      }
    } catch (e) {
      console.warn('Reverse geocode failed:', e);
    }
    return 'Mevcut Konum';
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
            resolve({ lat, lon, name: cityName });
          },
          async () => {
            const ipLoc = await fetchIpLocation();
            resolve(ipLoc);
          },
          { timeout: 6000 }
        );
      } else {
        fetchIpLocation().then(resolve);
      }
    });
  }

  async function fetchIpLocation() {
    // Try ipapi.co first
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
    } catch (e) {
      console.warn('ipapi.co fetch failed, trying ip-api.com:', e);
    }

    // Secondary fallback: ip-api.com
    try {
      const res = await fetch('http://ip-api.com/json');
      if (res.ok) {
        const data = await res.json();
        return {
          lat: data.lat || 39.9334,
          lon: data.lon || 32.8597,
          name: data.city || 'Ankara'
        };
      }
    } catch (e) {
      console.warn('ip-api.com fetch failed:', e);
    }

    // Absolute fallback: Ankara
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
      console.warn('Weather API fallback used:', err);
      return {
        temp: 24,
        feels: 25,
        humidity: 52,
        wind: 14,
        max: 27,
        min: 18,
        desc: 'Az Bulutlu',
        icon: 'cloud-sun',
        cityName: cityName
      };
    }
  }

  // Fetch Aladhan Prayer Times with EXACT LOCAL DATE + LAT/LON
  async function fetchPrayerTimes(lat, lon) {
    const now = new Date();
    const dStr = String(now.getDate()).padStart(2, '0');
    const mStr = String(now.getMonth() + 1).padStart(2, '0');
    const yStr = now.getFullYear();
    const dateStr = `${dStr}-${mStr}-${yStr}`;

    try {
      // Method 13 = Diyanet İşleri Başkanlığı Turkey
      const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lon}&method=13`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Prayer API error');
      const json = await res.json();
      const timings = json.data.timings;
      const hijri = json.data.date.hijri;

      // In Turkish Diyanet calendars:
      // İmsak = Fajr (or Imsak)
      // Güneş = Sunrise
      // Öğle = Dhuhr
      // İkindi = Asr
      // Akşam = Maghrib
      // Yatsı = Isha
      return {
        imsak: timings.Fajr || timings.Imsak,
        gunes: timings.Sunrise,
        ogle: timings.Dhuhr,
        ikindi: timings.Asr,
        aksam: timings.Maghrib,
        yatsi: timings.Isha,
        hijriDay: hijri.day,
        hijriMonth: hijri.month.tr || hijri.month.en || 'MUHARREM',
        hijriYear: hijri.year
      };
    } catch (err) {
      console.warn('Prayer API fallback used:', err);
      return {
        imsak: '03:22',
        gunes: '05:18',
        ogle: '12:59',
        ikindi: '16:56',
        aksam: '20:32',
        yatsi: '22:19',
        hijriDay: '17',
        hijriMonth: 'MUHARREM',
        hijriYear: '1448'
      };
    }
  }

  return {
    CITIES,
    detectLocation,
    fetchWeather,
    fetchPrayerTimes
  };
})();
