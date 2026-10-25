/* Key layout of the mini "the little pianist" piano: 18 keys, C4 → F5.
   Colours copied from the dots printed on the fallboard (left → right). */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';

  const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const SOLFEGE = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
  const FLATS = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };

  const FIRST_MIDI = 60; // C4
  const LAST_MIDI = 77;  // F5

  // [colour, glitter, english colour name, turkish colour name, computer key]
  const DOTS = {
    C4:  ['#F3EBDD', false, 'Cream',  'Krem',      'a'],
    'C#4': ['#2D4D86', false, 'Ocean',  'Okyanus',   'w'],
    D4:  ['#8CC6DA', false, 'Sky',    'Gökyüzü',   's'],
    'D#4': ['#D6BE9C', true,  'Sand',   'Kum',       'e'],
    E4:  ['#F1D6DC', false, 'Pink',   'Pembe',     'd'],
    F4:  ['#86B7A4', true,  'Sage',   'Adaçayı',   'f'],
    'F#4': ['#5E1E36', false, 'Berry',  'Böğürtlen', 't'],
    G4:  ['#2F6F6C', false, 'Teal',   'Deniz',     'g'],
    'G#4': ['#5B4FA8', false, 'Violet', 'Mor',       'y'],
    A4:  ['#AEDDEC', false, 'Ice',    'Buz',       'h'],
    'A#4': ['#33414F', false, 'Slate',  'Kurşuni',   'u'],
    B4:  ['#FFFFFF', false, 'Snow',   'Kar',       'j'],
    C5:  ['#CDA349', true,  'Gold',   'Altın',     'k'],
    'C#5': ['#8E8B67', true,  'Olive',  'Zeytin',    'o'],
    D5:  ['#79CBD3', false, 'Aqua',   'Su',        'l'],
    'D#5': ['#1B2A55', false, 'Navy',   'Lacivert',  'p'],
    E5:  ['#EACBBE', false, 'Peach',  'Şeftali',   ';'],
    F5:  ['#6FC1B0', false, 'Mint',   'Nane',      "'"]
  };

  function luminance(hex) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  const KEYS = [];
  const BY_ID = {};
  const BY_KBD = {};
  let whiteIndex = 0;
  for (let midi = FIRST_MIDI; midi <= LAST_MIDI; midi++) {
    const pc = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    const name = NAMES[pc];
    const id = name + octave;
    const d = DOTS[id];
    const black = name.length > 1;
    const key = {
      id, midi, name, octave, pc, black,
      index: KEYS.length,
      whiteIndex: black ? whiteIndex - 1 : whiteIndex, // for black keys: white key on its left
      color: d[0],
      glitter: d[1],
      colorName: { en: d[2], tr: d[3] },
      kbd: d[4],
      light: luminance(d[0]) > 0.72,
      freq: 440 * Math.pow(2, (midi - 69) / 12)
    };
    if (!black) whiteIndex++;
    KEYS.push(key);
    BY_ID[id] = key;
    BY_KBD[d[4]] = key;
  }

  function midiToId(midi) {
    const pc = ((midi % 12) + 12) % 12;
    return NAMES[pc] + (Math.floor(midi / 12) - 1);
  }

  // Accepts "C4", "c#4", "Db4", "Bb4", "C" (defaults to octave 4). Returns canonical id or null.
  function normalize(token, defaultOctave) {
    const m = /^([A-Ga-g])([#b♯♭]?)(-?\d)?$/.exec(String(token).trim());
    if (!m) return null;
    const letter = m[1].toUpperCase();
    const acc = m[2] === '♯' ? '#' : m[2] === '♭' ? 'b' : m[2];
    const octave = m[3] !== undefined ? parseInt(m[3], 10) : (defaultOctave || 4);
    let midi = (octave + 1) * 12 + NAMES.indexOf(letter);
    if (acc === '#') midi++;
    if (acc === 'b') midi--;
    return midiToId(midi);
  }

  function inRange(id) { return !!BY_ID[id]; }

  // Human label for a key depending on the chosen label style.
  function label(id, style, lang) {
    const k = BY_ID[id];
    if (!k) return id;
    if (style === 'solfege') return SOLFEGE[k.pc].replace('#', '♯');
    if (style === 'colors') return k.colorName[lang] || k.colorName.en;
    if (style === 'none') return '';
    return k.name.replace('#', '♯');
  }

  function flatName(id) {
    const k = BY_ID[id];
    return k && FLATS[k.name] ? FLATS[k.name].replace('b', '♭') : null;
  }

  ZP.notes = {
    NAMES, SOLFEGE, FIRST_MIDI, LAST_MIDI, KEYS, BY_ID, BY_KBD,
    WHITE_COUNT: KEYS.filter(k => !k.black).length,
    midiToId, normalize, inRange, label, flatName,
    freqToMidi: f => 69 + 12 * Math.log2(f / 440)
  };
})(window.ZP);
