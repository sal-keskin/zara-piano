/* Unified note input: on-screen piano, computer keyboard, MIDI keyboard and microphone.
   Everything ends up as ZP.bus 'note' events: { key: 'C4', source, time }, and held keys
   also send 'noteoff' when they are let go. */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';

  let muted = false; // when true, notes are not sounded (e.g. while a game plays a question)
  let blocked = false; // when true, input is ignored completely

  // A tap (mic notes and anything without a key-up): sounds and rings out naturally.
  function emit(id, source) {
    if (blocked || !ZP.notes.BY_ID[id]) return;
    if (source !== 'mic' && !muted) ZP.audio.play(id);
    ZP.store.countNote(source);
    ZP.bus.emit('note', { key: id, source, time: ZP.audio.now() });
  }

  // Press-and-hold: the note sounds while the finger / key stays down. `token` identifies
  // the finger (pointer id), keyboard key or MIDI note so several keys can be held at once.
  const held = new Map(); // token -> { id, source, voice }
  function noteOn(id, source, token) {
    if (blocked || !ZP.notes.BY_ID[id]) return;
    token = source + ':' + token;
    if (held.has(token)) noteOff(token);
    const voice = muted ? null : ZP.audio.play(id, { hold: true });
    held.set(token, { id, source, voice });
    ZP.store.countNote(source);
    ZP.bus.emit('note', { key: id, source, time: ZP.audio.now(), held: true });
  }
  function noteOff(token) {
    const h = held.get(token);
    if (!h) return;
    held.delete(token);
    if (h.voice) h.voice.release();
    ZP.bus.emit('noteoff', { key: h.id, source: h.source, time: ZP.audio.now() });
  }
  const release = (source, token) => noteOff(source + ':' + token);
  function releaseAll() { Array.from(held.keys()).forEach(noteOff); }
  function heldKeys() { return Array.from(held.values()).map(h => h.id); }

  function onKeyDown(e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const k = ZP.notes.BY_KBD[e.key.toLowerCase()];
    if (!k || held.has('kbd:' + k.kbd)) return;
    e.preventDefault();
    noteOn(k.id, 'kbd', k.kbd);
  }
  function onKeyUp(e) {
    const k = ZP.notes.BY_KBD[(e.key || '').toLowerCase()];
    if (k) release('kbd', k.kbd);
  }

  // MIDI keyboards: any octave is folded into our range.
  function initMIDI() {
    if (!navigator.requestMIDIAccess) return;
    navigator.requestMIDIAccess().then(access => {
      const hook = input => {
        input.onmidimessage = msg => {
          const [st, note, vel] = msg.data;
          const cmd = st & 0xf0;
          if (cmd === 0x90 && vel > 0) {
            let n = note;
            while (n < ZP.notes.FIRST_MIDI) n += 12;
            while (n > ZP.notes.LAST_MIDI) n -= 12;
            noteOn(ZP.notes.midiToId(n), 'midi', note);
          } else if (cmd === 0x80 || (cmd === 0x90 && vel === 0)) {
            release('midi', note);
          }
        };
      };
      access.inputs.forEach(hook);
      access.onstatechange = e => { if (e.port.type === 'input' && e.port.state === 'connected') hook(e.port); };
    }).catch(() => { /* no MIDI permission — fine */ });
  }

  function init() {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', releaseAll);
    document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });
    initMIDI();
  }

  ZP.input = {
    init, emit, noteOn, release, releaseAll, heldKeys,
    set muted(v) { muted = v; }, get muted() { return muted; },
    set blocked(v) { blocked = v; }, get blocked() { return blocked; }
  };
})(window.ZP);
