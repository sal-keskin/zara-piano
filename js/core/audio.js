/* Web Audio synthesiser: toy piano (metal rods), music box, soft piano, xylophone, 8-bit. */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';

  let ctx = null, master = null, dry = null, wet = null, noiseBuf = null;

  const PRESETS = {
    // Toy pianos strike small metal rods: bright, bell-like, inharmonic overtones.
    toy:      { partials: [[1, 1, 1.0], [2, 0.18, 0.45], [5.4, 0.08, 0.12], [8.9, 0.03, 0.06]], decay: 1.6, click: 0.12, wet: 0.18 },
    musicbox: { partials: [[1, 1, 1.0], [3, 0.12, 0.4], [4.2, 0.1, 0.25], [6.3, 0.04, 0.1]], decay: 2.6, click: 0.04, wet: 0.3 },
    piano:    { partials: [[1, 1, 1.0], [2, 0.45, 0.7], [3, 0.22, 0.5], [4, 0.12, 0.35], [5, 0.06, 0.25]], decay: 1.9, click: 0.03, wet: 0.2, wave: 'triangle' },
    xylo:     { partials: [[1, 1, 0.5], [3.93, 0.32, 0.12], [9.2, 0.1, 0.05]], decay: 0.55, click: 0.25, wet: 0.15 },
    chip:     { partials: [[1, 1, 0.35]], decay: 0.35, click: 0, wet: 0.08, wave: 'square', gain: 0.35 }
  };

  function ensure() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC({ latencyHint: 'interactive' });
    master = ctx.createGain();
    master.gain.value = vol();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12;
    comp.ratio.value = 4;
    master.connect(comp).connect(ctx.destination);
    dry = ctx.createGain();
    wet = ctx.createGain();
    dry.connect(master);
    const rev = ctx.createConvolver();
    rev.buffer = impulse(1.4);
    wet.connect(rev).connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    return ctx;
  }

  function impulse(seconds) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    }
    return buf;
  }

  function vol() {
    const v = ZP.store ? ZP.store.setting('volume') : 0.8;
    return Math.max(0, Math.min(1, v)) * 0.9;
  }

  function setVolume(v) {
    if (master) master.gain.setTargetAtTime(Math.max(0, Math.min(1, v)) * 0.9, ctx.currentTime, 0.02);
  }

  function freqOf(id) {
    const k = ZP.notes.BY_ID[id];
    if (k) return k.freq;
    const m = /^([A-G]#?)(\d)$/.exec(id);
    if (!m) return 440;
    const midi = (parseInt(m[2], 10) + 1) * 12 + ZP.notes.NAMES.indexOf(m[1]);
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /* Plays a note. opts: { when (ctx time), dur (seconds, for sustain cut), velocity, preset } */
  function play(id, opts) {
    opts = opts || {};
    if (!ensure()) return;
    const p = PRESETS[opts.preset || (ZP.store && ZP.store.setting('sound')) || 'toy'] || PRESETS.toy;
    const f = freqOf(id);
    const t = Math.max(opts.when || 0, ctx.currentTime);
    const vel = (opts.velocity || 0.9) * (p.gain || 1);
    // higher notes ring a little shorter, like real rods
    const decay = p.decay * Math.pow(261.6 / f, 0.35);
    const out = ctx.createGain();
    out.gain.value = vel * 0.32;
    out.connect(opts.dest ? opts.dest.dry : dry);
    const send = ctx.createGain();
    send.gain.value = p.wet;
    out.connect(send).connect(opts.dest ? opts.dest.wet : wet);

    const stopAt = t + decay * 1.2 + 0.1;
    p.partials.forEach(([ratio, amp, dScale], i) => {
      const o = ctx.createOscillator();
      o.type = i === 0 && p.wave ? p.wave : 'sine';
      o.frequency.value = f * ratio * (i ? 1 + (Math.random() - 0.5) * 0.002 : 1);
      const g = ctx.createGain();
      const d = Math.max(0.05, decay * dScale);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(amp, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0008, t + d);
      if (opts.dur && opts.dur < d) {
        g.gain.setTargetAtTime(0.0001, t + opts.dur, 0.06);
      }
      o.connect(g).connect(out);
      o.start(t);
      o.stop(stopAt);
    });

    if (p.click) {
      const n = ctx.createBufferSource();
      n.buffer = noiseBuf;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = Math.min(9000, f * 6);
      bp.Q.value = 1.5;
      const g = ctx.createGain();
      g.gain.value = p.click;
      n.connect(bp).connect(g).connect(out);
      n.start(t);
    }
    setTimeout(() => { try { out.disconnect(); send.disconnect(); } catch (e) { /* noop */ } }, (stopAt - ctx.currentTime) * 1000 + 200);
  }

  // A stoppable group of sounds: everything scheduled on it can be silenced at once.
  function channel() {
    if (!ensure()) return null;
    const d = ctx.createGain(), w = ctx.createGain();
    d.connect(dry);
    w.connect(wet);
    return {
      dry: d, wet: w,
      stop() {
        const now = ctx.currentTime;
        [d, w].forEach(g => { g.gain.cancelScheduledValues(now); g.gain.setTargetAtTime(0, now, 0.02); });
        setTimeout(() => { try { d.disconnect(); w.disconnect(); } catch (e) { /* noop */ } }, 200);
      }
    };
  }

  function click(when, accent, dest) {
    if (!ensure()) return;
    const t = Math.max(when || 0, ctx.currentTime);
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = accent ? 1600 : 1050;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(accent ? 0.25 : 0.15, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    o.connect(g).connect(dest ? dest.dry : dry);
    o.start(t);
    o.stop(t + 0.08);
  }

  // Little jingles for feedback
  function jingle(kind) {
    if (!ensure()) return;
    const t = ctx.currentTime + 0.02;
    const seqs = {
      good: [['C5', 0], ['E5', 0.08]],
      great: [['C5', 0], ['E5', 0.09], ['G4', 0.18], ['C5', 0.27]],
      win: [['C4', 0], ['E4', 0.12], ['G4', 0.24], ['C5', 0.36], ['E5', 0.5], ['C5', 0.62]],
      bad: [['D#4', 0], ['C4', 0.12]],
      level: [['G4', 0], ['C5', 0.1], ['E5', 0.2], ['F5', 0.3], ['E5', 0.45]]
    };
    (seqs[kind] || seqs.good).forEach(([n, dt]) => play(n, { when: t + dt, velocity: kind === 'bad' ? 0.35 : 0.5, preset: kind === 'bad' ? 'xylo' : 'musicbox' }));
  }

  /* Plays a list of {key, start(beats), dur(beats)} at bpm. Returns a handle with stop(). */
  function sequence(notes, bpm, opts) {
    opts = opts || {};
    if (!ensure()) return { stop() {}, done: Promise.resolve() };
    const spb = 60 / bpm;
    const t0 = ctx.currentTime + (opts.delay || 0.15);
    const timers = [];
    const ch = channel();
    let stopped = false;
    notes.forEach((n, i) => {
      if (n.rest) return;
      play(n.key, { when: t0 + n.start * spb, dur: n.dur * spb * 1.1, velocity: opts.velocity, dest: ch });
      if (opts.onNote) {
        const ms = (t0 + n.start * spb - ctx.currentTime) * 1000;
        timers.push(setTimeout(() => { if (!stopped) opts.onNote(n, i); }, Math.max(0, ms)));
      }
    });
    const last = notes.reduce((m, n) => Math.max(m, n.start + n.dur), 0);
    let resolveDone;
    const done = new Promise(r => { resolveDone = r; });
    timers.push(setTimeout(() => { if (!stopped) resolveDone(true); }, (t0 + last * spb - ctx.currentTime) * 1000 + 50));
    return {
      t0,
      done,
      stop() {
        stopped = true;
        timers.forEach(clearTimeout);
        ch.stop();
        resolveDone(false);
      }
    };
  }

  // Turns "C4 E4:2 R:0.5 G4" into timed notes.
  function parse(str) {
    let t = 0;
    return ZP.songs.parseLine(str).map(n => {
      const o = Object.assign({ start: t }, n);
      t += n.dur;
      return o;
    });
  }

  ZP.audio = {
    PRESETS,
    ensure, play, click, jingle, sequence, parse, setVolume, channel,
    get ctx() { return ctx; },
    now() { return ctx ? ctx.currentTime : performance.now() / 1000; }
  };
})(window.ZP);
