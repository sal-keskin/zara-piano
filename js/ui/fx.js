/* Fun stuff: confetti, toasts, modals, the star mascot and read-aloud. */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';
  const { el } = ZP.util;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── confetti ──
  let canvas, cctx, parts = [], raf = 0;
  function confetti(amount) {
    if (reduced) return;
    if (!canvas) {
      canvas = el('canvas.confetti', { 'aria-hidden': 'true' });
      document.body.appendChild(canvas);
      cctx = canvas.getContext('2d');
    }
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colors = ZP.notes.KEYS.map(k => k.color).concat(['#F7C948', '#FF8FA3', '#7BD3EA']);
    for (let i = 0; i < (amount || 120); i++) {
      parts.push({
        x: innerWidth / 2 + (Math.random() - 0.5) * innerWidth * 0.5,
        y: innerHeight * 0.35,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 14 - 4,
        r: Math.random() * 6 + 4,
        c: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.3,
        shape: Math.random() < 0.3 ? 'star' : Math.random() < 0.5 ? 'circle' : 'rect',
        life: 1
      });
    }
    if (!raf) raf = requestAnimationFrame(step);
  }
  function star(c, r) {
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    c.closePath();
    c.fill();
  }
  function step() {
    cctx.clearRect(0, 0, innerWidth, innerHeight);
    parts.forEach(p => {
      p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (p.y > innerHeight * 0.7) p.life -= 0.02;
      cctx.save();
      cctx.globalAlpha = Math.max(0, p.life);
      cctx.translate(p.x, p.y);
      cctx.rotate(p.rot);
      cctx.fillStyle = p.c;
      if (p.shape === 'star') star(cctx, p.r);
      else if (p.shape === 'circle') { cctx.beginPath(); cctx.arc(0, 0, p.r / 1.6, 0, 7); cctx.fill(); }
      else cctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
      cctx.restore();
    });
    parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 40);
    raf = parts.length ? requestAnimationFrame(step) : 0;
    if (!raf) cctx.clearRect(0, 0, innerWidth, innerHeight);
  }

  // ── toasts ──
  let toastBox;
  function toast(html, kind) {
    if (!toastBox) {
      toastBox = el('div.toasts', { 'aria-live': 'polite' });
      document.body.appendChild(toastBox);
    }
    const t = el('div.toast' + (kind ? '.' + kind : ''), { html });
    toastBox.appendChild(t);
    setTimeout(() => t.classList.add('out'), 2200);
    setTimeout(() => t.remove(), 2700);
  }

  // ── modal ──
  function modal(content, opts) {
    opts = opts || {};
    const close = () => { wrap.classList.add('out'); setTimeout(() => wrap.remove(), 200); document.removeEventListener('keydown', onKey); if (opts.onClose) opts.onClose(); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    const box = el('div.modal' + (opts.cls ? '.' + opts.cls : ''), { role: 'dialog', 'aria-modal': 'true' }, content);
    const wrap = el('div.modal-wrap', { onclick: e => { if (e.target === wrap && !opts.sticky) close(); } }, box);
    document.body.appendChild(wrap);
    document.addEventListener('keydown', onKey);
    const focusable = box.querySelector('button, [href], input, select');
    if (focusable) setTimeout(() => focusable.focus(), 30);
    return { close, el: box };
  }

  // ── mascot (a smiling star, like in the song book) ──
  function mascot(mood, size) {
    const mouth = {
      happy: 'M38 58 Q50 68 62 58',
      wow: 'M46 58 Q50 66 54 58 Q50 62 46 58',
      think: 'M42 60 L58 58',
      sad: 'M40 63 Q50 55 60 63'
    }[mood || 'happy'];
    const eyes = mood === 'wow'
      ? '<circle cx="40" cy="45" r="3.4"/><circle cx="60" cy="45" r="3.4"/>'
      : '<ellipse cx="40" cy="46" rx="2.6" ry="3.4"/><ellipse cx="60" cy="46" rx="2.6" ry="3.4"/>';
    const s = size || 90;
    return el('span.mascot', {
      'aria-hidden': 'true',
      html: '<svg viewBox="0 0 100 100" width="' + s + '" height="' + s + '">' +
        '<path d="M50 6 L62 36 L94 38 L69 58 L78 90 L50 72 L22 90 L31 58 L6 38 L38 36 Z" fill="#A9D4DC" stroke="#86BCC6" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<g fill="#4A4A48">' + eyes + '</g>' +
        '<circle cx="33" cy="55" r="4" fill="#F4B6B6" opacity=".7"/><circle cx="67" cy="55" r="4" fill="#F4B6B6" opacity=".7"/>' +
        '<path d="' + mouth + '" fill="none" stroke="#4A4A48" stroke-width="2.6" stroke-linecap="round"/></svg>'
    });
  }

  function bubble(mood, text) {
    return el('div.bubble-row', mascot(mood, 70), el('div.bubble', el('span', { html: text })));
  }

  // ── read aloud ──
  function speak(text, force) {
    if (!window.speechSynthesis) return;
    if (!force && !ZP.store.setting('speak')) return;
    const clean = String(text).replace(/<[^>]+>/g, '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '');
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = ZP.store.setting('lang') === 'tr' ? 'tr-TR' : 'en-US';
    u.rate = 0.95;
    u.pitch = 1.15;
    speechSynthesis.speak(u);
  }
  function stopSpeaking() { if (window.speechSynthesis) speechSynthesis.cancel(); }

  ZP.fx = { confetti, toast, modal, mascot, bubble, speak, stopSpeaking, reduced };
})(window.ZP);
