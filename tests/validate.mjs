// Data & logic checks that run in plain Node (no browser needed): `npm test`
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { console, navigator: { language: 'en-US' }, setTimeout, clearTimeout, performance };
ctx.window = ctx;
vm.createContext(ctx);
const load = f => vm.runInContext(readFileSync(join(root, f), 'utf8'), ctx, { filename: f });
['js/core/util.js', 'js/data/notes.js', 'js/data/songs.js', 'js/data/lessons.js', 'js/i18n.js', 'js/core/store.js', 'js/core/pitch.js'].forEach(load);
ctx.ZP.views = {};
load('js/views/helper.js');
const ZP = ctx.ZP;

let failures = 0, checks = 0;
function ok(cond, msg) {
  checks++;
  if (!cond) { failures++; console.error('✗ ' + msg); }
}

// ── keys ──
ok(ZP.notes.KEYS.length === 18, '18 keys');
ok(ZP.notes.KEYS.filter(k => !k.black).length === 11, '11 white keys');
ok(ZP.notes.KEYS[0].id === 'C4' && ZP.notes.KEYS[17].id === 'F5', 'range C4..F5');
ok(new Set(ZP.notes.KEYS.map(k => k.kbd)).size === 18, 'unique computer keys');
ok(ZP.notes.normalize('Bb4') === 'A#4' && ZP.notes.normalize('c') === 'C4' && ZP.notes.normalize('Db5') === 'C#5', 'note normalisation');

// ── songs ──
const songs = ZP.songs.SONGS;
ok(songs.length >= 10, 'at least 10 songs (have ' + songs.length + ')');
ok(new Set(songs.map(s => s.id)).size === songs.length, 'unique song ids');
songs.forEach(s => {
  ok(ZP.songs.WORLDS.some(w => w.id === s.world), s.id + ': valid world');
  ok(s.title.en && s.title.tr, s.id + ': title in both languages');
  let c;
  try { c = ZP.songs.compile(s); } catch (e) { ok(false, s.id + ': compiles (' + e.message + ')'); return; }
  ok(c.notes.length > 0, s.id + ': has notes');
  c.notes.forEach(n => ok(ZP.notes.inRange(n.key), s.id + ': ' + n.key + ' fits the 18 keys'));
  s.lines.forEach((ln, i) => {
    const notes = ZP.songs.parseLine(ln[0]).filter(n => !n.rest).length;
    const syl = (ln[1] || '').trim().split(/\s+/).filter(Boolean).length;
    ok(syl === 0 || syl === notes, s.id + ' line ' + (i + 1) + ': ' + syl + ' syllables for ' + notes + ' notes');
  });
});
// difficulty goes up: first world uses few keys, black keys only from world 4 on
songs.filter(s => s.world <= 3).forEach(s => ok(!ZP.songs.compile(s).hasBlack, s.id + ': no black keys before world 4'));
songs.filter(s => s.world === 1).forEach(s => ok(ZP.songs.compile(s).keysUsed.length <= 4, s.id + ': world 1 uses ≤ 4 keys'));
ok(ZP.songs.WORLDS.every((w, i, a) => i === 0 || w.need > a[i - 1].need), 'worlds unlock in order');

// song maker
const made = ZP.songs.fromText('t', 'C D E:2 | Bb c5', 100);
ok(ZP.songs.compile(made).notes.map(n => n.key).join() === 'C4,D4,E4,A#4,C5', 'song maker parses text');
let threw = false;
try { ZP.songs.fromText('t', 'C D G5', 100); } catch (e) { threw = true; }
ok(threw, 'song maker rejects notes outside the piano');

// ── lessons ──
const L = ZP.lessons.LESSONS;
ok(L.length >= 8, 'at least 8 lessons');
L.forEach(l => {
  ok(l.title.en && l.title.tr, l.id + ': title EN/TR');
  l.steps.forEach((st, i) => {
    const where = l.id + ' step ' + (i + 1);
    ok(st.text && st.text.en && st.text.tr, where + ': text EN/TR');
    (st.keys || []).concat(st.show || []).forEach(k => ok(ZP.notes.inRange(k), where + ': key ' + k));
    if (st.notes) ZP.songs.parseLine(st.notes).forEach(n => ok(n.rest || ZP.notes.inRange(n.key), where + ': note ' + n.key));
    if (st.type === 'quiz') ok(st.options[st.answer], where + ': quiz answer exists');
  });
});

// ── translations ──
const { en, tr } = ZP.i18n.STR;
const missingTr = Object.keys(en).filter(k => !(k in tr));
const extraTr = Object.keys(tr).filter(k => !(k in en));
ok(!missingTr.length, 'missing Turkish strings: ' + missingTr.join(', '));
ok(!extraTr.length, 'Turkish strings without English: ' + extraTr.join(', '));
const used = new Set();
const walk = d => readdirSync(d, { withFileTypes: true }).forEach(f => {
  const p = join(d, f.name);
  if (f.isDirectory()) walk(p);
  else if (p.endsWith('.js')) for (const m of readFileSync(p, 'utf8').matchAll(/\bt\('([^']+)'/g)) used.add(m[1]);
});
walk(join(root, 'js'));
const dynamic = [
  ...['home', 'learn', 'songs', 'helper', 'games', 'free', 'stickers', 'settings'].map(k => 'nav.' + k),
  ...['listen', 'learn', 'play'].flatMap(m => ['mode.' + m, 'mode.' + m + '.desc']),
  ...['simon', 'detective', 'rush', 'highlow'].flatMap(g => ['game.' + g, 'game.' + g + '.desc']),
  ...['toy', 'musicbox', 'piano', 'xylo', 'chip'].map(p => 'sound.' + p),
  ...['amazing', 'great', 'good', 'try', 'perfect', 'goodHit', 'miss', 'hold'].map(r => 'res.' + r),
  ...['morning', 'afternoon', 'evening'].map(x => 'home.' + x),
  ...['learn', 'songs', 'games', 'free', 'stickers', 'chart'].map(x => 'home.tile.' + x)
];
[...used].filter(k => !k.endsWith('.')).concat(dynamic).forEach(k => ok(k in en, 'missing UI string "' + k + '"'));

// ── stickers ──
ok(new Set(ZP.store.STICKERS.map(s => s.id)).size === ZP.store.STICKERS.length, 'unique sticker ids');
ZP.songs.WORLDS.forEach(w => ok(ZP.store.STICKERS.some(s => s.id === 'world-' + w.id), 'sticker for world ' + w.id));

// ── pitch detection on synthetic toy-piano tones ──
const SR = 48000;
function tone(freq, n = 1024) {
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    a[i] = 0.5 * Math.sin(2 * Math.PI * freq * t) + 0.15 * Math.sin(2 * Math.PI * freq * 2 * t) + 0.05 * Math.sin(2 * Math.PI * freq * 5.4 * t);
  }
  return a;
}
ZP.notes.KEYS.forEach(k => {
  const r = ZP.pitch.detect(tone(k.freq), SR);
  ok(Math.abs(1200 * Math.log2(r.freq / k.freq)) < 20, 'detects ' + k.id + ' (' + k.freq.toFixed(1) + ' Hz → ' + r.freq.toFixed(1) + ')');
  ok(ZP.pitch.mapFreq(r.freq).id === k.id, 'maps ' + k.id);
});
const silent = ZP.pitch.detect(new Float32Array(1024), SR);
ok(silent.rms === 0, 'silence has no energy');
// a piano that sounds an octave higher folds back onto the right keys
ok(ZP.pitch.mapFreq(ZP.notes.BY_ID.G4.freq * 2).id === 'G4', 'octave-high toy piano folds into range');
// quick calibration: everything 0.6 semitone flat
ZP.store.state.calibration.offset = -0.6;
ok(ZP.pitch.mapFreq(ZP.notes.BY_ID.E4.freq * Math.pow(2, -0.6 / 12)).id === 'E4', 'calibration offset corrects a flat piano');
ZP.store.state.calibration.offset = 0;

// ── song guesser ──
const twinkle = ZP.songs.compile(songs.find(s => s.id === 'twinkle')).notes.slice(0, 7).map(n => n.key);
const g = ZP.helper.guessSong(twinkle);
ok(g && g.song.id === 'twinkle', 'guesses Twinkle from its first notes (got ' + (g && g.song.id) + ')');
const fur = ZP.songs.compile(songs.find(s => s.id === 'fur-elise')).notes.slice(0, 9).map(n => n.key);
ok((ZP.helper.guessSong(fur) || {}).song?.id === 'fur-elise', 'guesses Für Elise');

// ── levels ──
ok(ZP.store.levelInfo(0).level === 1 && ZP.store.levelInfo(5000).level === ZP.store.LEVELS.length, 'level curve');

console.log((failures ? '✗ ' + failures + ' of ' : '✓ all ') + checks + ' checks' + (failures ? ' failed' : ' passed'));
process.exit(failures ? 1 : 0);
