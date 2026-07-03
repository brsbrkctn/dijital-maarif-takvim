/**
 * DATA STORE MODULE (v2.1.0)
 * Loads user data from ./data.json with support for multi-event bulleted arrays.
 */

window.DataStore = (function () {
  let dailyDataCache = null;

  // Fallback dataset dictionary if date is missing in JSON
  const defaultQuotes = [
    { text: "Düşünmeden öğrenmek boşuna, öğrenmeden düşünmek tehlikelidir.", author: "Konfüçyüs" },
    { text: "Hayatta en hakiki mürşit ilimdir, fendir.", author: "Mustafa Kemal Atatürk" },
    { text: "İlim ilim bilmektir, ilim kendin bilmektir.", author: "Yunus Emre" }
  ];

  const defaultHistory = [
    "1932 - Türkiye, Milletler Cemiyeti'ne katılma davetini kabul etti.",
    "1924 - 8. Yaz Olimpiyat Oyunları Paris'te başladı."
  ];

  const defaultNames = [
    { male: "Kaan", male_desc: "", female: "Defne", female_desc: "" }
  ];

  // Helper to load data.json or fallback daily_data.json
  async function loadData() {
    try {
      let response = await fetch('./data.json');
      if (!response.ok) {
        response = await fetch('./data/daily_data.json');
      }
      if (response.ok) {
        dailyDataCache = await response.json();
      } else {
        console.warn('data.json yüklenemedi, varsayılan veriler kullanılacak.');
      }
    } catch (err) {
      console.warn('data.json okuma hatası:', err);
    }
  }

  // Retrieve data for specific date (Format: MM-DD)
  async function getDailyContent(month, day) {
    if (!dailyDataCache) {
      await loadData();
    }

    const key = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (dailyDataCache && dailyDataCache[key]) {
      const raw = dailyDataCache[key];

      // Process history / olaylar array into bulleted HTML list
      let historyText = "";
      if (Array.isArray(raw.olaylar) && raw.olaylar.length > 0) {
        historyText = `<ul class="history-list">${raw.olaylar.map(item => `<li>${item}</li>`).join('')}</ul>`;
      } else if (raw.olaylar) {
        historyText = `<p>${raw.olaylar}</p>`;
      } else if (raw.history) {
        historyText = `<p>${raw.history}</p>`;
      }

      // Process quote / ozlu_soz
      let quoteText = "";
      let quoteAuthorText = "";

      if (raw.ozlu_soz) {
        const fullQuote = raw.ozlu_soz;
        const lastDashIndex = fullQuote.lastIndexOf(' - ');
        if (lastDashIndex !== -1) {
          quoteText = fullQuote.substring(0, lastDashIndex).trim();
          quoteAuthorText = fullQuote.substring(lastDashIndex + 3).trim();
        } else {
          quoteText = fullQuote;
          quoteAuthorText = "";
        }
      } else if (raw.quote) {
        quoteText = raw.quote;
        quoteAuthorText = raw.quote_author || "";
      }

      // Process names / isim_onerileri
      let maleName = "";
      let maleDesc = "";
      let femaleName = "";
      let femaleDesc = "";

      if (raw.isim_onerileri) {
        maleName = raw.isim_onerileri.erkek || raw.isim_onerileri.male || "";
        femaleName = raw.isim_onerileri.kiz || raw.isim_onerileri.female || "";
      } else {
        maleName = raw.name_male || "";
        maleDesc = raw.name_male_desc || "";
        femaleName = raw.name_female || "";
        femaleDesc = raw.name_female_desc || "";
      }

      return {
        history: historyText,
        quote: quoteText,
        quote_author: quoteAuthorText,
        name_male: maleName,
        name_male_desc: maleDesc,
        name_female: femaleName,
        name_female_desc: femaleDesc
      };
    }

    // Fallback if key is not found
    const dayOfYear = Math.floor((new Date(2026, month - 1, day) - new Date(2026, 0, 0)) / 86400000);
    const quoteObj = defaultQuotes[dayOfYear % defaultQuotes.length];
    const historyText = `<ul class="history-list"><li>${defaultHistory[dayOfYear % defaultHistory.length]}</li></ul>`;
    const nameObj = defaultNames[dayOfYear % defaultNames.length];

    return {
      history: historyText,
      quote: quoteObj.text,
      quote_author: quoteObj.author,
      name_male: nameObj.male,
      name_male_desc: nameObj.desc || "",
      name_female: nameObj.female,
      name_female_desc: nameObj.desc || ""
    };
  }

  return {
    getDailyContent
  };
})();
