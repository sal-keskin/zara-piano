/* Microphone listener: detects which key of the real toy piano was played.
   Pitch: McLeod Pitch Method (normalised square difference). Notes are emitted on onsets.
   Toy pianos are often out of tune or an octave higher than written, so a calibration
   (one key = global offset, or all 18 keys) maps the real piano onto our keys. */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';

  let stream = null, analyser = null, source = null, buf = null, timer = null, hp = null;
  let running = false;
  let lastRms = 0, envelope = 0, lastKey = null, stableKey = null, stableCount = 0, armed = true;
  let lastEmit = 0;
  const listeners = new Set();

  function supported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && (window.AudioContext || window.webkitAudioContext));
  }

  async function start() {
    if (running) return true;
    const ctx = ZP.audio.ensure();
    if (!ctx || !supported()) throw new Error('unsupported');
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
    });
    source = ctx.createMediaStreamSource(stream);
    hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 150;
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(hp).connect(analyser);
    buf = new Float32Array(analyser.fftSize);
    running = true;
    timer = setInterval(tick, 25);
    ZP.bus.emit('mic', { on: true });
    return true;
  }

  function stop() {
    running = false;
    clearInterval(timer);
    timer = null;
    if (stream) stream.getTracks().forEach(t => t.stop());
    try { source && source.disconnect(); hp && hp.disconnect(); } catch (e) { /* noop */ }
    stream = source = analyser = hp = null;
    ZP.bus.emit('mic', { on: false });
  }

  // ── McLeod pitch method ──
  function detect(data, sampleRate) {
    const n = data.length;
    let rms = 0;
    for (let i = 0; i < n; i++) rms += data[i] * data[i];
    rms = Math.sqrt(rms / n);
    const minLag = Math.floor(sampleRate / 1500);
    const maxLag = Math.min(Math.floor(sampleRate / 150), n >> 1);
    const nsdf = new Float32Array(maxLag + 1);
    for (let tau = minLag; tau <= maxLag; tau++) {
      let acf = 0, m = 0;
      for (let i = 0; i < n - tau; i++) {
        const a = data[i], b = data[i + tau];
        acf += a * b;
        m += a * a + b * b;
      }
      nsdf[tau] = m > 0 ? (2 * acf) / m : 0;
    }
    // collect key maxima between positive zero crossings
    const peaks = [];
    let pos = false, best = -1, bestTau = 0;
    for (let tau = minLag; tau <= maxLag; tau++) {
      const v = nsdf[tau];
      if (!pos && v > 0 && nsdf[tau - 1] <= 0) { pos = true; best = -1; }
      if (pos) {
        if (v > best) { best = v; bestTau = tau; }
        if (v <= 0) { pos = false; if (best > 0) peaks.push([bestTau, best]); }
      }
    }
    if (pos && best > 0) peaks.push([bestTau, best]);
    if (!peaks.length) return { rms, freq: 0, clarity: 0 };
    const top = Math.max(...peaks.map(p => p[1]));
    const chosen = peaks.find(p => p[1] >= top * 0.88);
    let tau = chosen[0];
    // parabolic interpolation
    const a = nsdf[tau - 1] || 0, b = nsdf[tau], c = nsdf[tau + 1] || 0;
    const denom = a - 2 * b + c;
    const shift = denom ? 0.5 * (a - c) / denom : 0;
    const t = tau + shift;
    return { rms, freq: sampleRate / t, clarity: chosen[1] };
  }

  // Maps a frequency to one of our 18 keys, using calibration if available.
  function mapFreq(freq) {
    const cal = ZP.store.state.calibration;
    if (cal.keys) {
      let bestId = null, bestD = Infinity;
      Object.keys(cal.keys).forEach(id => {
        const d = Math.abs(12 * Math.log2(freq / cal.keys[id]));
        if (d < bestD) { bestD = d; bestId = id; }
      });
      return bestD < 0.7 ? { id: bestId, cents: 0 } : null;
    }
    let midi = ZP.notes.freqToMidi(freq) - (cal.offset || 0);
    let r = Math.round(midi);
    const cents = Math.round((midi - r) * 100);
    // fold octaves into the 18-key range
    while (r < ZP.notes.FIRST_MIDI) r += 12;
    while (r > ZP.notes.LAST_MIDI) r -= 12;
    return { id: ZP.notes.midiToId(r), cents };
  }

  function threshold() {
    const s = ZP.store.setting('sensitivity'); // 0..1, higher = more sensitive
    return 0.004 + (1 - s) * 0.04;
  }

  function tick() {
    if (!running || !analyser) return;
    analyser.getFloatTimeDomainData(buf);
    // a 1024-sample window holds 3+ periods of the lowest note and keeps the CPU cost low
    const res = detect(buf.subarray(buf.length - 1024), ZP.audio.ctx.sampleRate);
    const thr = threshold();
    envelope = Math.max(res.rms, envelope * 0.9);
    const onset = res.rms > thr && res.rms > lastRms * 1.5 && res.rms > envelope * 0.6;
    lastRms = res.rms;
    if (res.rms < thr * 0.6) { armed = true; stableKey = null; stableCount = 0; }

    let mapped = null;
    if (res.rms > thr && res.clarity > 0.8 && res.freq > 120 && res.freq < 2500) mapped = mapFreq(res.freq);
    ZP.bus.emit('pitch', { freq: mapped ? res.freq : 0, rms: res.rms, key: mapped && mapped.id, cents: mapped ? mapped.cents : 0, clarity: res.clarity });
    listeners.forEach(fn => fn(res));

    if (!mapped) { stableCount = 0; return; }
    if (mapped.id === stableKey) stableCount++;
    else { stableKey = mapped.id; stableCount = 1; }
    if (onset) armed = true;
    const now = performance.now();
    // emit once per strike: needs 2 stable frames; a new key or a fresh onset re-arms
    if (stableCount >= 2 && (armed || (mapped.id !== lastKey && now - lastEmit > 120))) {
      armed = false;
      lastKey = mapped.id;
      lastEmit = now;
      ZP.input.emit(mapped.id, 'mic');
    }
  }

  // Collects a steady frequency for calibration (resolves with Hz).
  function capture(timeoutMs) {
    return new Promise((resolve, reject) => {
      const vals = [];
      const thr = threshold();
      const fn = res => {
        if (res.rms > thr && res.clarity > 0.85 && res.freq > 120 && res.freq < 2500) vals.push(res.freq);
        if (vals.length >= 6) {
          listeners.delete(fn);
          clearTimeout(to);
          vals.sort((a, b) => a - b);
          resolve(vals[vals.length >> 1]);
        }
      };
      listeners.add(fn);
      const to = setTimeout(() => { listeners.delete(fn); reject(new Error('timeout')); }, timeoutMs || 15000);
    });
  }

  ZP.pitch = {
    supported, start, stop, capture, detect, mapFreq,
    get running() { return running; }
  };
})(window.ZP);
