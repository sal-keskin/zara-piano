/* Song library. Every note must fit the 18 keys (C4 → F5).
   Notation per line: "E4 D4 C4:2"  → note[:beats] (default 1 beat), "R:1" is a rest.
   Lyrics: one syllable per note, "~" = the same syllable continues. */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';

  const WORLDS = [
    { id: 1, emoji: '🌱', color: '#A8C9BA', need: 0,
      title: { en: 'First Steps', tr: 'İlk Adımlar' },
      about: { en: 'Just 3–4 white keys. Perfect for your very first songs!', tr: 'Sadece 3–4 beyaz tuş. İlk şarkıların için harika!' } },
    { id: 2, emoji: '🖐️', color: '#9FD3E6', need: 5,
      title: { en: 'Five Finger Friends', tr: 'Beş Parmak Dostları' },
      about: { en: 'Thumb on Cream (C) and use all five fingers.', tr: 'Başparmak Krem (Do) tuşunda, beş parmağın da çalışıyor.' } },
    { id: 3, emoji: '🦘', color: '#E7C08F', need: 14,
      title: { en: 'Big Jumps', tr: 'Büyük Zıplamalar' },
      about: { en: 'Songs that travel across the whole keyboard.', tr: 'Tüm klavyeyi gezen şarkılar.' } },
    { id: 4, emoji: '🖤', color: '#B9A8D8', need: 24,
      title: { en: 'Black Key Adventures', tr: 'Siyah Tuş Maceraları' },
      about: { en: 'Time to use the black keys!', tr: 'Siyah tuşları kullanma zamanı!' } },
    { id: 5, emoji: '👑', color: '#E3B7AE', need: 36,
      title: { en: 'Little Maestro', tr: 'Küçük Maestro' },
      about: { en: 'Real classical pieces. You can do it!', tr: 'Gerçek klasik eserler. Sen yaparsın!' } }
  ];

  const SONGS = [
    // ───────────── World 1 · First Steps ─────────────
    { id: 'hot-cross-buns', world: 1, emoji: '🥯', bpm: 96, meter: 4,
      title: { en: 'Hot Cross Buns', tr: 'Sıcak Çörekler' },
      lines: [
        ['E4 D4 C4:2', 'Hot cross buns'],
        ['E4 D4 C4:2', 'Hot cross buns'],
        ['C4:0.5 C4:0.5 C4:0.5 C4:0.5 D4:0.5 D4:0.5 D4:0.5 D4:0.5', 'One a pen ny, two a pen ny'],
        ['E4 D4 C4:2', 'Hot cross buns']
      ] },
    { id: 'rain-rain', world: 1, emoji: '🌧️', bpm: 100, meter: 4,
      title: { en: 'Rain, Rain, Go Away', tr: 'Yağmur Yağmur Git Hadi' },
      lines: [
        ['G4 E4 G4:0.5 G4:0.5 E4:2', 'Rain, rain, go a way'],
        ['G4:0.5 G4:0.5 E4:0.5 A4:0.5 G4:0.5 G4:0.5 E4:2', 'come a gain an oth er day'],
        ['G4:0.5 G4:0.5 E4:0.5 A4:0.5 G4:0.5 G4:0.5 E4:2', 'lit tle chil dren want to play'],
        ['G4 E4 G4:0.5 G4:0.5 E4:2', 'rain, rain, go a way']
      ] },
    { id: 'mary-lamb', world: 1, emoji: '🐑', bpm: 108, meter: 4,
      title: { en: 'Mary Had a Little Lamb', tr: 'Mary\'nin Kuzusu' },
      lines: [
        ['E4 D4 C4 D4 E4 E4 E4:2', 'Ma ry had a lit tle lamb'],
        ['D4 D4 D4:2 E4 G4 G4:2', 'lit tle lamb, lit tle lamb'],
        ['E4 D4 C4 D4 E4 E4 E4 E4', 'Ma ry had a lit tle lamb its'],
        ['D4 D4 E4 D4 C4:4', 'fleece was white as snow']
      ] },
    { id: 'clair-lune', world: 1, emoji: '🌙', bpm: 100, meter: 4,
      title: { en: 'Au Clair de la Lune', tr: 'Ay Işığında' },
      lines: [
        ['C4 C4 C4 D4 E4:2 D4:2', 'Au clair de la lu ne'],
        ['C4 E4 D4 D4 C4:4', 'mon a mi Pier rot'],
        ['C4 C4 C4 D4 E4:2 D4:2', 'Prê te moi ta plu me'],
        ['C4 E4 D4 D4 C4:4', 'pour é crire un mot']
      ] },

    // ───────────── World 2 · Five Finger Friends ─────────────
    { id: 'twinkle', world: 2, emoji: '⭐', bpm: 100, meter: 4,
      title: { en: 'Twinkle Twinkle Little Star', tr: 'Küçük Yıldız (Twinkle Twinkle)' },
      book: true,
      lines: [
        ['C4 C4 G4 G4 A4 A4 G4:2', 'Twin kle, twin kle, lit tle star'],
        ['F4 F4 E4 E4 D4 D4 C4:2', 'how I won der what you are'],
        ['G4 G4 F4 F4 E4 E4 D4:2', 'up a bove the world so high'],
        ['G4 G4 F4 F4 E4 E4 D4:2', 'like a dia mond in the sky'],
        ['C4 C4 G4 G4 A4 A4 G4:2', 'Twin kle, twin kle, lit tle star'],
        ['F4 F4 E4 E4 D4 D4 C4:2', 'how I won der what you are']
      ] },
    { id: 'ode-to-joy', world: 2, emoji: '🎉', bpm: 104, meter: 4,
      title: { en: 'Ode to Joy', tr: 'Neşeye Övgü' },
      lines: [
        ['E4 E4 F4 G4 G4 F4 E4 D4', 'Joy ful, joy ful, we a dore thee'],
        ['C4 C4 D4 E4 E4:1.5 D4:0.5 D4:2', 'God of glo ry, Lord of love'],
        ['E4 E4 F4 G4 G4 F4 E4 D4', 'Hearts un fold like flowers be fore thee'],
        ['C4 C4 D4 E4 D4:1.5 C4:0.5 C4:2', 'op\'n ing to the sun a bove']
      ] },
    { id: 'jingle-bells', world: 2, emoji: '🔔', bpm: 120, meter: 4,
      title: { en: 'Jingle Bells', tr: 'Jingle Bells (Yılbaşı)' },
      lines: [
        ['E4 E4 E4:2 E4 E4 E4:2', 'Jin gle bells, jin gle bells'],
        ['E4 G4 C4:1.5 D4:0.5 E4:4', 'jin gle all the way'],
        ['F4 F4 F4:1.5 F4:0.5 F4 E4 E4 E4:0.5 E4:0.5', 'Oh what fun it is to ride in a'],
        ['E4 D4 D4 E4 D4:2 G4:2', 'one horse o pen sleigh, hey!'],
        ['E4 E4 E4:2 E4 E4 E4:2', 'Jin gle bells, jin gle bells'],
        ['E4 G4 C4:1.5 D4:0.5 E4:4', 'jin gle all the way'],
        ['F4 F4 F4:1.5 F4:0.5 F4 E4 E4 E4:0.5 E4:0.5', 'Oh what fun it is to ride in a'],
        ['G4 G4 F4 D4 C4:4', 'one horse o pen sleigh']
      ] },
    { id: 'london-bridge', world: 2, emoji: '🌉', bpm: 108, meter: 4,
      title: { en: 'London Bridge', tr: 'Londra Köprüsü' },
      lines: [
        ['G4:1.5 A4:0.5 G4 F4 E4 F4 G4:2', 'Lon don Bridge is fall ing down'],
        ['D4 E4 F4:2 E4 F4 G4:2', 'fall ing down, fall ing down'],
        ['G4:1.5 A4:0.5 G4 F4 E4 F4 G4:2', 'Lon don Bridge is fall ing down'],
        ['D4:2 G4:2 E4 C4:3', 'my fair la dy']
      ] },
    { id: 'saints', world: 2, emoji: '🎺', bpm: 120, meter: 4,
      title: { en: 'When the Saints Go Marching In', tr: 'When the Saints (Caz Marşı)' },
      lines: [
        ['C4 E4 F4 G4:4', 'Oh when the saints'],
        ['C4 E4 F4 G4:4', 'go march ing in'],
        ['C4 E4 F4 G4:2 E4:2 C4:2 E4:2 D4:4', 'oh when the saints go march ing in'],
        ['E4 E4 D4 C4:3 C4 E4:2 G4 G4 F4:3', 'and I want to be in that num ber'],
        ['E4 F4 G4:2 E4:2 C4:2 D4:2 C4:4', 'when the saints go march ing in']
      ] },
    { id: 'lightly-row', world: 2, emoji: '🛶', bpm: 112, meter: 4,
      title: { en: 'Lightly Row (Hänschen klein)', tr: 'Daha Dün Annemizin' },
      lines: [
        ['G4 E4 E4:2 F4 D4 D4:2', 'Light ly row, light ly row'],
        ['C4 D4 E4 F4 G4 G4 G4:2', 'o\'er the glas sy waves we go'],
        ['G4 E4 E4:2 F4 D4 D4:2', 'smooth ly glide, smooth ly glide'],
        ['C4 E4 G4 G4 C4:4', 'on the si lent tide'],
        ['D4 D4 D4 D4 D4 E4 F4:2', 'let the winds and wa ters be'],
        ['E4 E4 E4 E4 E4 F4 G4:2', 'min gled with our me lo dy'],
        ['G4 E4 E4:2 F4 D4 D4:2', 'sing and float, sing and float'],
        ['C4 E4 G4 G4 C4:4', 'in our lit tle boat']
      ] },

    // ───────────── World 3 · Big Jumps ─────────────
    { id: 'row-boat', world: 3, emoji: '🚣', bpm: 96, meter: 6,
      title: { en: 'Row, Row, Row Your Boat', tr: 'Kürek Çek (Row Your Boat)' },
      lines: [
        ['C4:1.5 C4:1.5 C4 D4:0.5 E4:1.5', 'Row, row, row your boat'],
        ['E4 D4:0.5 E4 F4:0.5 G4:3', 'gent ly down the stream'],
        ['C5:0.5 C5:0.5 C5:0.5 G4:0.5 G4:0.5 G4:0.5 E4:0.5 E4:0.5 E4:0.5 C4:0.5 C4:0.5 C4:0.5', 'mer ri ly, mer ri ly, mer ri ly, mer ri ly'],
        ['G4 F4:0.5 E4 D4:0.5 C4:3', 'life is but a dream']
      ] },
    { id: 'old-macdonald', world: 3, emoji: '🐮', bpm: 120, meter: 4,
      title: { en: 'Old MacDonald Had a Farm', tr: 'Ali Baba\'nın Çiftliği' },
      lines: [
        ['F4 F4 F4 C4 D4 D4 C4:2', 'Old Mac Don ald had a farm'],
        ['A4 A4 G4 G4 F4:3', 'E I E I O'],
        ['C4 F4 F4 F4 C4 D4 D4 C4:2', 'and on that farm he had a cow'],
        ['A4 A4 G4 G4 F4:2', 'E I E I O'],
        ['C4:0.5 C4:0.5 F4 F4 F4 C4:0.5 C4:0.5 F4 F4 F4:2', 'with a moo moo here and a moo moo there'],
        ['F4:0.5 F4:0.5 F4 F4:0.5 F4:0.5 F4 F4:0.5 F4:0.5 F4:0.5 F4:0.5 F4 F4', 'here a moo, there a moo, ev ery where a moo moo'],
        ['F4 F4 F4 C4 D4 D4 C4:2', 'Old Mac Don ald had a farm'],
        ['A4 A4 G4 G4 F4:4', 'E I E I O']
      ] },
    { id: 'merry-christmas', world: 3, emoji: '🎄', bpm: 126, meter: 3,
      title: { en: 'We Wish You a Merry Christmas', tr: 'Mutlu Noeller Dileriz' },
      lines: [
        ['G4 C5 C5:0.5 D5:0.5 C5:0.5 B4:0.5 A4 A4', 'We wish you a mer ry Christ mas'],
        ['A4 D5 D5:0.5 E5:0.5 D5:0.5 C5:0.5 B4 G4', 'we wish you a mer ry Christ mas'],
        ['G4 E5 E5:0.5 F5:0.5 E5:0.5 D5:0.5 C5 A4', 'we wish you a mer ry Christ mas'],
        ['G4:0.5 G4:0.5 A4 D5 B4 C5:2', 'and a hap py new year']
      ] },
    { id: 'brahms-lullaby', world: 3, emoji: '😴', bpm: 84, meter: 3,
      title: { en: 'Brahms\' Lullaby', tr: 'Brahms Ninnisi' },
      lines: [
        ['E4:0.5 E4:0.5 G4:2 E4:0.5 E4:0.5 G4:2', ''],
        ['E4:0.5 G4:0.5 C5 B4:1.5 A4:0.5 A4 G4', ''],
        ['D4:0.5 E4:0.5 F4 D4 D4:0.5 E4:0.5 F4:2', ''],
        ['D4:0.5 F4:0.5 B4:0.5 A4:0.5 G4 B4 C5:2', ''],
        ['C4:0.5 C4:0.5 C5:2 A4:0.5 F4:0.5 G4:2', ''],
        ['E4:0.5 C4:0.5 F4 G4 A4 G4:2', ''],
        ['C4:0.5 C4:0.5 C5:2 A4:0.5 F4:0.5 G4:2', ''],
        ['E4:0.5 C4:0.5 F4 E4 D4 C4:3', '']
      ] },
    { id: 'silent-night', world: 3, emoji: '🌌', bpm: 92, meter: 6,
      title: { en: 'Silent Night', tr: 'Sessiz Gece' },
      lines: [
        ['G4:1.5 A4:0.5 G4 E4:3', 'Si lent night ~'],
        ['G4:1.5 A4:0.5 G4 E4:3', 'ho ly night ~'],
        ['D5:2 D5 B4:3 C5:2 C5 G4:3', 'All is calm, all is bright'],
        ['A4:2 A4 C5:1.5 B4:0.5 A4 G4:1.5 A4:0.5 G4 E4:3', 'round yon vir gin mo ther and child ~'],
        ['A4:2 A4 C5:1.5 B4:0.5 A4 G4:1.5 A4:0.5 G4 E4:3', 'Ho ly in fant so ten der and mild'],
        ['D5:2 D5 F5:1.5 D5:0.5 B4 C5:3 E5:3', 'sleep in hea ven ly peace ~'],
        ['C5:1.5 G4:0.5 E4 G4:1.5 F4:0.5 D4 C4:6', 'sleep ~ in hea ven ly peace']
      ] },

    // ───────────── World 4 · Black Key Adventures ─────────────
    { id: 'happy-birthday', world: 4, emoji: '🎂', bpm: 100, meter: 3,
      title: { en: 'Happy Birthday', tr: 'İyi ki Doğdun' },
      lines: [
        ['C4:0.75 C4:0.25 D4 C4 F4 E4:2', 'Hap py birth day to you'],
        ['C4:0.75 C4:0.25 D4 C4 G4 F4:2', 'Hap py birth day to you'],
        ['C4:0.75 C4:0.25 C5 A4 F4 E4 D4:2', 'Hap py birth day dear dar ling'],
        ['A#4:0.75 A#4:0.25 A4 F4 G4 F4:2', 'Hap py birth day to you']
      ] },
    { id: 'frere-jacques', world: 4, emoji: '🛎️', bpm: 112, meter: 4,
      title: { en: 'Frère Jacques', tr: 'Tembel Çocuk (Frère Jacques)' },
      lines: [
        ['F4 G4 A4 F4 F4 G4 A4 F4', 'Are you sleep ing, are you sleep ing'],
        ['A4 A#4 C5:2 A4 A#4 C5:2', 'Bro ther John, Bro ther John'],
        ['C5:0.5 D5:0.5 C5:0.5 A#4:0.5 A4 F4 C5:0.5 D5:0.5 C5:0.5 A#4:0.5 A4 F4', 'Morn ing bells are ring ing, morn ing bells are ring ing'],
        ['F4 C4 F4:2 F4 C4 F4:2', 'Ding, dang, dong, ding, dang, dong']
      ] },
    { id: 'itsy-bitsy', world: 4, emoji: '🕷️', bpm: 100, meter: 6,
      title: { en: 'Itsy Bitsy Spider', tr: 'Minik Örümcek' },
      lines: [
        ['C4:0.5 F4 F4:0.5 F4 G4:0.5 A4:1.5 A4:1.5', 'The it sy bit sy spi der'],
        ['A4 G4:0.5 F4 G4:0.5 A4:1.5 F4:1.5', 'climbed up the wa ter spout'],
        ['A4:1.5 A4 A#4:0.5 C5:1.5 C5:1.5 A#4 A4:0.5 A#4 C5:0.5 A4:3', 'Down came the rain and washed the spi der out'],
        ['F4:1.5 F4 G4:0.5 A4:1.5 A4:1.5 G4 F4:0.5 G4 A4:0.5 F4:3', 'Out came the sun and dried up all the rain'],
        ['C4:0.5 C4:0.5 F4 F4:0.5 F4 G4:0.5 A4:1.5 A4:1.5', 'and the it sy bit sy spi der'],
        ['A4 G4:0.5 F4 G4:0.5 A4:1.5 F4:3', 'climbed up the spout a gain']
      ] },
    { id: 'yankee-doodle', world: 4, emoji: '🪶', bpm: 120, meter: 4,
      title: { en: 'Yankee Doodle', tr: 'Yankee Doodle' },
      lines: [
        ['F4 F4 G4 A4 F4 A4 G4 C4', 'Yan kee Doo dle went to town a'],
        ['F4 F4 G4 A4 F4:2 E4:2', 'ri ding on a po ny'],
        ['F4 F4 G4 A4 A#4 A4 G4 F4', 'stuck a fea ther in his cap and'],
        ['E4 C4 D4 E4 F4:2 F4:2', 'called it mac a ro ni']
      ] },
    { id: 'amazing-grace', world: 4, emoji: '🕊️', bpm: 88, meter: 3,
      title: { en: 'Amazing Grace', tr: 'Amazing Grace' },
      lines: [
        ['C4 F4:2 A4:0.5 F4:0.5 A4:2 G4 F4:2 D4 C4:2', 'A maz ing ~ grace how sweet the sound'],
        ['C4 F4:2 A4:0.5 F4:0.5 A4:2 G4 C5:3', 'that saved a ~ wretch like me'],
        ['A4 C5:1.5 A4:0.5 C5:0.5 A4:0.5 F4:2 C4 D4:1.5 F4:0.5 F4:0.5 D4:0.5 C4:2', 'I once ~ was lost ~ but now ~ am found ~'],
        ['C4 F4:2 A4:0.5 F4:0.5 A4:2 G4 F4:3', 'was blind but ~ now I see']
      ] },

    // ───────────── World 5 · Little Maestro ─────────────
    { id: 'minuet', world: 5, emoji: '💃', bpm: 100, meter: 3,
      title: { en: 'Minuet in G (Petzold)', tr: 'Sol Majör Menuet (Petzold)' },
      note: { en: 'Moved down to fit your 18 keys — it starts on the Gold key.', tr: '18 tuşuna sığsın diye biraz kaydırıldı — Altın tuşla başlar.' },
      lines: [
        ['C5 F4:0.5 G4:0.5 A4:0.5 A#4:0.5 C5 F4 F4', ''],
        ['D5 A#4:0.5 C5:0.5 D5:0.5 E5:0.5 F5 F4 F4', ''],
        ['A#4 C5:0.5 A#4:0.5 A4:0.5 G4:0.5 A4 A#4:0.5 A4:0.5 G4:0.5 F4:0.5', ''],
        ['E4 F4:0.5 G4:0.5 A4:0.5 F4:0.5 G4:3', ''],
        ['C5 F4:0.5 G4:0.5 A4:0.5 A#4:0.5 C5 F4 F4', ''],
        ['D5 A#4:0.5 C5:0.5 D5:0.5 E5:0.5 F5 F4 F4', ''],
        ['A#4 C5:0.5 A#4:0.5 A4:0.5 G4:0.5 A4 A#4:0.5 A4:0.5 G4:0.5 F4:0.5', ''],
        ['G4 A4:0.5 G4:0.5 F4:0.5 E4:0.5 F4:3', '']
      ] },
    { id: 'fur-elise', world: 5, emoji: '🎼', bpm: 72, meter: 3,
      title: { en: 'Für Elise (Beethoven)', tr: 'Für Elise (Beethoven)' },
      lines: [
        ['E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 A4:1.5', ''],
        ['C4:0.5 E4:0.5 A4:0.5 B4:1.5', ''],
        ['E4:0.5 G#4:0.5 B4:0.5 C5:1.5', ''],
        ['E4:0.5 E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 A4:1.5', ''],
        ['C4:0.5 E4:0.5 A4:0.5 B4:1.5', ''],
        ['E4:0.5 C5:0.5 B4:0.5 A4:3', '']
      ] },
    { id: 'greensleeves', world: 5, emoji: '🍃', bpm: 96, meter: 3,
      title: { en: 'Greensleeves', tr: 'Greensleeves' },
      lines: [
        ['A4 C5:2 D5 E5:1.5 F5:0.5 E5 D5:2 B4', ''],
        ['G4:1.5 A4:0.5 B4 C5:2 A4 A4:1.5 G#4:0.5 A4 B4:2 G#4 E4:2', ''],
        ['A4 C5:2 D5 E5:1.5 F5:0.5 E5 D5:2 B4', ''],
        ['G4:1.5 A4:0.5 B4 C5:1.5 B4:0.5 A4 G#4:1.5 F#4:0.5 G#4 A4:3', '']
      ] },
    { id: 'ode-to-joy-full', world: 5, emoji: '🏆', bpm: 108, meter: 4,
      title: { en: 'Ode to Joy (Full, with black key)', tr: 'Neşeye Övgü (Tam, siyah tuşlu)' },
      lines: [
        ['A4 A4 A#4 C5 C5 A#4 A4 G4', 'Joy ful, joy ful, we a dore thee'],
        ['F4 F4 G4 A4 A4:1.5 G4:0.5 G4:2', 'God of glo ry, Lord of love'],
        ['A4 A4 A#4 C5 C5 A#4 A4 G4', 'Hearts un fold like flowers be fore thee'],
        ['F4 F4 G4 A4 G4:1.5 F4:0.5 F4:2', 'op\'n ing to the sun a bove'],
        ['G4 G4 A4 F4 G4 A4:0.5 A#4:0.5 A4 F4', 'Melt the clouds of sin and ~ sad ness'],
        ['G4 A4:0.5 A#4:0.5 A4 G4 F4 G4 C4:2', 'drive the ~ dark of doubt a way'],
        ['A4 A4 A#4 C5 C5 A#4 A4 G4', 'Giv er of im mor tal glad ness'],
        ['F4 F4 G4 A4 G4:1.5 F4:0.5 F4:2', 'fill us with the light of day']
      ] }
  ];

  // ── parser ──────────────────────────────────────────────
  function parseLine(text) {
    const out = [];
    String(text).trim().split(/\s+/).filter(Boolean).forEach(tok => {
      const m = /^([A-Ga-g][#b♯♭]?\d|R|r)(?::(\d*\.?\d+))?$/.exec(tok);
      if (!m) throw new Error('Bad note token "' + tok + '"');
      const dur = m[2] ? parseFloat(m[2]) : 1;
      if (m[1] === 'R' || m[1] === 'r') out.push({ rest: true, dur });
      else {
        const id = ZP.notes.normalize(m[1]);
        out.push({ key: id, dur });
      }
    });
    return out;
  }

  function splitLyrics(text) {
    return String(text || '').trim().split(/\s+/).filter(Boolean);
  }

  // Turns a song definition into a flat list of timed notes.
  function compile(song) {
    if (song._compiled) return song._compiled;
    const notes = [];
    const lines = [];
    let t = 0;
    song.lines.forEach((ln, li) => {
      const parsed = parseLine(ln[0]);
      const syl = splitLyrics(ln[1]);
      let si = 0;
      const startIdx = notes.length;
      parsed.forEach(p => {
        if (!p.rest) {
          const lyric = syl[si++];
          notes.push({ key: p.key, dur: p.dur, start: t, line: li, lyric: lyric === '~' ? '' : (lyric || ''), cont: lyric === '~' });
        }
        t += p.dur;
      });
      lines.push({ start: startIdx, end: notes.length, lyrics: ln[1] || '' });
    });
    const used = Array.from(new Set(notes.map(n => n.key)));
    const compiled = {
      notes, lines, totalBeats: t,
      keysUsed: used,
      hasBlack: used.some(id => ZP.notes.BY_ID[id] && ZP.notes.BY_ID[id].black)
    };
    Object.defineProperty(song, '_compiled', { value: compiled, enumerable: false, configurable: true });
    return compiled;
  }

  // Builds a playable song from free text (for "My Songs"). Accepts "C D E" / "C4 D4:2" / "Bb4", line per row.
  function fromText(title, text, bpm) {
    const rows = String(text).split(/\n|\|/).map(s => s.trim()).filter(Boolean);
    const lines = rows.map(r => {
      const toks = r.split(/[\s,]+/).filter(Boolean).map(tok => {
        const m = /^([A-Ga-g][#b♯♭]?)(\d)?(?::(\d*\.?\d+))?$/.exec(tok);
        if (!m) {
          if (/^[Rr](:\d*\.?\d+)?$/.test(tok)) return tok.toUpperCase();
          throw new Error(tok);
        }
        const id = ZP.notes.normalize(m[1] + (m[2] || '4'));
        if (!ZP.notes.inRange(id)) throw new Error(tok);
        return id + (m[3] ? ':' + m[3] : '');
      });
      return [toks.join(' '), ''];
    }).filter(l => l[0]);
    if (!lines.length) throw new Error('empty');
    return { title: { en: title, tr: title }, emoji: '🎵', bpm: bpm || 100, meter: 4, world: 0, lines };
  }

  ZP.songs = { WORLDS, SONGS, parseLine, compile, fromText };
})(window.ZP);
