/* Unified note input: on-screen piano, computer keyboard, MIDI keyboard and microphone.
   Everything ends up as ZP.bus 'note' events: { key: 'C4', source, time }. */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';

  let muted = false; // when true, notes are not sounded (e.g. while a game plays a question)
  let blocked = false; // when true, input is ignored completely

  function emit(id, source) {
    if (blocked || !ZP.notes.BY_ID[id]) return;
    if (source !== 'mic' && !muted) ZP.audio.play(id);
    ZP.store.countNote(source);
    ZP.bus.emit('note', { key: id, source, time: ZP.audio.now() });
  }

  const down = new Set();
  function onKeyDown(e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const k = ZP.notes.BY_KBD[e.key.toLowerCase()];
    if (!k || down.has(e.key)) return;
    down.add(e.key);
    e.preventDefault();
    emit(k.id, 'kbd');
  }
  function onKeyUp(e) { down.delete(e.key); }

  // MIDI keyboards: any octave is folded into our range.
  function initMIDI() {
    if (!navigator.requestMIDIAccess) return;
    navigator.requestMIDIAccess().then(access => {
      const hook = input => {
        input.onmidimessage = msg => {
          const [st, note, vel] = msg.data;
          if ((st & 0xf0) === 0x90 && vel > 0) {
            let n = note;
            while (n < ZP.notes.FIRST_MIDI) n += 12;
            while (n > ZP.notes.LAST_MIDI) n -= 12;
            emit(ZP.notes.midiToId(n), 'midi');
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
    window.addEventListener('blur', () => down.clear());
    initMIDI();
  }

  ZP.input = {
    init, emit,
    set muted(v) { muted = v; }, get muted() { return muted; },
    set blocked(v) { blocked = v; }, get blocked() { return blocked; }
  };
})(window.ZP);
