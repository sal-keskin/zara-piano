/* Progress, settings and gamification (XP, levels, stars, stickers, streaks). Saved in localStorage. */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';

  const KEY = 'littlePianist.v1';

  const LEVELS = [
    { xp: 0, en: 'Tiny Tapper', tr: 'Minik Tıkırtı' },
    { xp: 100, en: 'Key Explorer', tr: 'Tuş Kaşifi' },
    { xp: 250, en: 'Dot Detective', tr: 'Nokta Dedektifi' },
    { xp: 450, en: 'Melody Maker', tr: 'Melodi Ustası' },
    { xp: 700, en: 'Tune Traveller', tr: 'Ezgi Gezgini' },
    { xp: 1000, en: 'Song Star', tr: 'Şarkı Yıldızı' },
    { xp: 1400, en: 'Rhythm Ranger', tr: 'Ritim Korucusu' },
    { xp: 1900, en: 'Piano Pal', tr: 'Piyano Dostu' },
    { xp: 2500, en: 'Keyboard Hero', tr: 'Klavye Kahramanı' },
    { xp: 3200, en: 'Little Maestro', tr: 'Küçük Maestro' },
    { xp: 4200, en: 'Grand Maestro', tr: 'Büyük Maestro' }
  ];

  const STICKERS = [
    { id: 'first-note', emoji: '🎹', en: 'First Note', tr: 'İlk Nota', den: 'Play your very first note', dtr: 'İlk notanı çal' },
    { id: 'first-lesson', emoji: '🎓', en: 'Good Student', tr: 'İyi Öğrenci', den: 'Finish a lesson', dtr: 'Bir dersi bitir' },
    { id: 'all-lessons', emoji: '🏅', en: 'Graduate', tr: 'Mezun', den: 'Finish all lessons', dtr: 'Bütün dersleri bitir' },
    { id: 'first-song', emoji: '🎶', en: 'First Song', tr: 'İlk Şarkı', den: 'Finish your first song', dtr: 'İlk şarkını bitir' },
    { id: 'three-stars', emoji: '🌟', en: 'Superstar', tr: 'Süperstar', den: 'Get 3 stars on a song', dtr: 'Bir şarkıda 3 yıldız al' },
    { id: 'perfect', emoji: '💎', en: 'Perfect!', tr: 'Kusursuz!', den: 'Play a whole song without a mistake', dtr: 'Bir şarkıyı hiç hata yapmadan çal' },
    { id: 'rhythm', emoji: '🥁', en: 'Rhythm Rocket', tr: 'Ritim Roketi', den: 'Finish a song in Rhythm mode', dtr: 'Ritim modunda bir şarkı bitir' },
    { id: 'black-keys', emoji: '🖤', en: 'Black Key Brave', tr: 'Siyah Tuş Cesuru', den: 'Finish a song with black keys', dtr: 'Siyah tuşlu bir şarkı bitir' },
    { id: 'world-1', emoji: '🌱', en: 'Sprout', tr: 'Filiz', den: 'Finish every song in First Steps', dtr: 'İlk Adımlar\'daki tüm şarkıları bitir' },
    { id: 'world-2', emoji: '🖐️', en: 'High Five', tr: 'Çak Bir Beşlik', den: 'Finish every song in Five Finger Friends', dtr: 'Beş Parmak Dostları\'ndaki tüm şarkıları bitir' },
    { id: 'world-3', emoji: '🦘', en: 'Kangaroo', tr: 'Kanguru', den: 'Finish every song in Big Jumps', dtr: 'Büyük Zıplamalar\'daki tüm şarkıları bitir' },
    { id: 'world-4', emoji: '🐈‍⬛', en: 'Black Cat', tr: 'Kara Kedi', den: 'Finish every song in Black Key Adventures', dtr: 'Siyah Tuş Maceraları\'ndaki tüm şarkıları bitir' },
    { id: 'world-5', emoji: '👑', en: 'Maestro Crown', tr: 'Maestro Tacı', den: 'Finish every song in Little Maestro', dtr: 'Küçük Maestro\'daki tüm şarkıları bitir' },
    { id: 'simon-5', emoji: '🧠', en: 'Memory Mouse', tr: 'Hafıza Faresi', den: 'Reach 5 in Echo Memory', dtr: 'Yankı Hafıza\'da 5\'e ulaş' },
    { id: 'simon-10', emoji: '🐘', en: 'Elephant Memory', tr: 'Fil Hafızası', den: 'Reach 10 in Echo Memory', dtr: 'Yankı Hafıza\'da 10\'a ulaş' },
    { id: 'detective', emoji: '🕵️', en: 'Ear Detective', tr: 'Kulak Dedektifi', den: '8 right in a row in Note Detective', dtr: 'Nota Dedektifi\'nde arka arkaya 8 doğru' },
    { id: 'rush', emoji: '⚡', en: 'Lightning Fingers', tr: 'Şimşek Parmaklar', den: 'Score 25 in Rainbow Rush', dtr: 'Gökkuşağı Koşusu\'nda 25 puan' },
    { id: 'highlow', emoji: '🎢', en: 'Roller Coaster', tr: 'Hız Treni', den: '10 right in High or Low', dtr: 'İnce mi Kalın mı\'da 10 doğru' },
    { id: 'composer', emoji: '✍️', en: 'Composer', tr: 'Besteci', den: 'Save your own song', dtr: 'Kendi şarkını kaydet' },
    { id: 'mic', emoji: '🎤', en: 'Real Pianist', tr: 'Gerçek Piyanist', den: 'Let the app hear your real piano', dtr: 'Uygulamaya gerçek piyanonu dinlet' },
    { id: 'tuned', emoji: '🔧', en: 'Piano Tuner', tr: 'Akort Ustası', den: 'Calibrate your real piano', dtr: 'Gerçek piyanonu ayarla' },
    { id: 'streak-3', emoji: '🔥', en: '3 Day Streak', tr: '3 Gün Seri', den: 'Practise 3 days in a row', dtr: '3 gün üst üste çalış' },
    { id: 'streak-7', emoji: '🌈', en: 'Week of Music', tr: 'Müzik Haftası', den: 'Practise 7 days in a row', dtr: '7 gün üst üste çalış' },
    { id: 'notes-500', emoji: '🎈', en: '500 Notes', tr: '500 Nota', den: 'Play 500 notes', dtr: '500 nota çal' },
    { id: 'notes-3000', emoji: '🚀', en: '3000 Notes', tr: '3000 Nota', den: 'Play 3000 notes', dtr: '3000 nota çal' },
    { id: 'daily', emoji: '📅', en: 'Daily Hero', tr: 'Günün Kahramanı', den: 'Play the Song of the Day', dtr: 'Günün Şarkısını çal' }
  ];

  function defaults() {
    const lang = (navigator.language || 'en').toLowerCase().startsWith('tr') ? 'tr' : 'en';
    return {
      v: 1,
      xp: 0,
      songs: {},      // id -> { learn: stars, play: stars, best: score }
      lessons: {},    // id -> true
      stickers: {},   // id -> timestamp
      best: { simon: 0, rush: 0, detective: 0, highlow: 0 },
      stats: { notes: 0, songs: 0, micNotes: 0 },
      streak: { count: 0, last: '' },
      daily: '',
      custom: [],     // user-made songs
      calibration: { offset: 0, keys: null },
      settings: {
        lang,
        labels: lang === 'tr' ? 'solfege' : 'letters',
        sound: 'toy',
        volume: 0.8,
        unlockAll: false,
        speak: false,
        sensitivity: 0.5,
        micLatency: 120,
        showKbd: true
      }
    };
  }

  let state = load();

  function load() {
    const d = defaults();
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return d;
      const s = JSON.parse(raw);
      return Object.assign(d, s, {
        settings: Object.assign(d.settings, s.settings || {}),
        best: Object.assign(d.best, s.best || {}),
        stats: Object.assign(d.stats, s.stats || {}),
        calibration: Object.assign(d.calibration, s.calibration || {})
      });
    } catch (e) {
      return d;
    }
  }

  let saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
    }, 150);
  }

  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function levelInfo(xp) {
    xp = xp === undefined ? state.xp : xp;
    let i = 0;
    while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].xp) i++;
    const cur = LEVELS[i];
    const next = LEVELS[i + 1];
    return {
      level: i + 1,
      title: cur,
      progress: next ? (xp - cur.xp) / (next.xp - cur.xp) : 1,
      toNext: next ? next.xp - xp : 0
    };
  }

  function addXP(n, reason) {
    if (!n) return;
    const before = levelInfo().level;
    state.xp += Math.round(n);
    touchStreak();
    save();
    ZP.bus.emit('xp', { amount: Math.round(n), reason });
    const after = levelInfo().level;
    if (after > before) ZP.bus.emit('levelup', levelInfo());
  }

  function touchStreak() {
    const t = today();
    if (state.streak.last === t) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yest = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
    state.streak.count = state.streak.last === yest ? state.streak.count + 1 : 1;
    state.streak.last = t;
    if (state.streak.count >= 3) award('streak-3');
    if (state.streak.count >= 7) award('streak-7');
    save();
  }

  function award(id) {
    if (state.stickers[id]) return false;
    const s = STICKERS.find(x => x.id === id);
    if (!s) return false;
    state.stickers[id] = Date.now();
    save();
    ZP.bus.emit('sticker', s);
    return true;
  }

  function songStars(id) {
    const r = state.songs[id];
    return r ? Math.max(r.learn || 0, r.play || 0) : 0;
  }

  function totalStars() {
    return ZP.songs.SONGS.reduce((sum, s) => sum + songStars(s.id), 0);
  }

  // Records a finished song; returns how many NEW stars were earned.
  function recordSong(id, mode, stars, extra) {
    const r = state.songs[id] || (state.songs[id] = { learn: 0, play: 0, best: 0 });
    const before = songStars(id);
    r[mode] = Math.max(r[mode] || 0, stars);
    if (extra && extra.score) r.best = Math.max(r.best || 0, extra.score);
    state.stats.songs++;
    save();
    const song = ZP.songs.SONGS.find(s => s.id === id);
    if (stars > 0) {
      award('first-song');
      if (stars >= 3) award('three-stars');
      if (mode === 'play') award('rhythm');
      if (song && ZP.songs.compile(song).hasBlack) award('black-keys');
      if (extra && extra.perfect) award('perfect');
      if (id === dailySongId() && state.daily !== today()) {
        state.daily = today();
        award('daily');
        addXP(50, 'daily');
      }
      ZP.songs.WORLDS.forEach(w => {
        const list = ZP.songs.SONGS.filter(s => s.world === w.id);
        if (list.every(s => songStars(s.id) > 0)) award('world-' + w.id);
      });
    }
    return Math.max(0, songStars(id) - before);
  }

  function completeLesson(id) {
    const first = !state.lessons[id];
    state.lessons[id] = true;
    save();
    award('first-lesson');
    if (ZP.lessons.LESSONS.every(l => state.lessons[l.id])) award('all-lessons');
    return first;
  }

  function worldUnlocked(worldId) {
    if (state.settings.unlockAll) return true;
    const w = ZP.songs.WORLDS.find(x => x.id === worldId);
    return !w || totalStars() >= w.need;
  }

  function dailySongId() {
    const t = today();
    let h = 0;
    for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0;
    const pool = ZP.songs.SONGS.filter(s => worldUnlocked(s.world));
    const list = pool.length ? pool : ZP.songs.SONGS;
    return list[h % list.length].id;
  }

  function countNote(source) {
    state.stats.notes++;
    if (source === 'mic') {
      state.stats.micNotes++;
      if (state.stats.micNotes >= 3) award('mic');
    }
    if (state.stats.notes === 1) award('first-note');
    if (state.stats.notes >= 500) award('notes-500');
    if (state.stats.notes >= 3000) award('notes-3000');
    save();
  }

  function setBest(game, score) {
    if (score > (state.best[game] || 0)) {
      state.best[game] = score;
      save();
      return true;
    }
    return false;
  }

  function setting(k, v) {
    if (v === undefined) return state.settings[k];
    state.settings[k] = v;
    save();
    ZP.bus.emit('settings', { key: k, value: v });
    return v;
  }

  function reset() {
    const keep = state.settings;
    state = defaults();
    state.settings = keep;
    save();
    ZP.bus.emit('reset');
  }

  function exportJSON() { return JSON.stringify(state, null, 1); }
  function importJSON(text) {
    const s = JSON.parse(text);
    if (!s || typeof s !== 'object' || s.v !== 1) throw new Error('bad file');
    localStorage.setItem(KEY, JSON.stringify(s));
    state = load();
    ZP.bus.emit('reset');
  }

  ZP.store = {
    LEVELS, STICKERS,
    get state() { return state; },
    save, today, levelInfo, addXP, award, songStars, totalStars, recordSong, completeLesson,
    worldUnlocked, dailySongId, countNote, setBest, setting, reset, exportJSON, importJSON, touchStreak
  };
})(window.ZP);
