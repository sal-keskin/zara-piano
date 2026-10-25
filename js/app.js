/* App shell: hash router, top bar (level / XP / stars / streak) and global celebrations. */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';
  const { el, clear } = ZP.util;
  const t = (k, v) => ZP.i18n.t(k, v);

  ZP.views = ZP.views || {};
  let current = null;

  const NAV = [
    ['home', '', '🏠'],
    ['learn', 'learn', '🎓'],
    ['songs', 'songs', '🎶'],
    ['helper', 'helper', '🎤'],
    ['games', 'games', '🎲'],
    ['free', 'free', '🎹'],
    ['stickers', 'stickers', '🏅']
  ];

  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '');
    const [path, query] = h.split('?');
    const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    const params = {};
    (query || '').split('&').filter(Boolean).forEach(kv => {
      const [k, v] = kv.split('=');
      params[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
    return { name: parts[0] || 'home', args: parts.slice(1), params };
  }

  function render() {
    const route = parseHash();
    const view = ZP.views[route.name] || ZP.views.home;
    if (current) current.dispose();
    document.querySelectorAll('.modal-wrap').forEach(m => m.remove());
    ZP.fx.stopSpeaking();
    ZP.input.blocked = false;
    ZP.input.muted = false;
    current = ZP.util.scope();
    const main = clear(document.getElementById('view'));
    main.className = 'view view-' + route.name;
    document.querySelectorAll('.tabs a').forEach(a => a.classList.toggle('active', a.dataset.route === route.name || (route.name === 'lesson' && a.dataset.route === 'learn') || (route.name === 'song' && a.dataset.route === 'songs') || (route.name === 'game' && a.dataset.route === 'games')));
    try {
      view(main, route, current);
    } catch (e) {
      console.error(e);
      main.appendChild(el('div.card', el('h2', '😿 ' + t('error')), el('p', String(e.message || e)), el('a.btn', { href: '#/' }, t('home'))));
    }
    dockLayout(main);
    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  /* Pages with a piano get an app-like layout: the piano sits in its own area at the bottom
     and everything else scrolls above it, so the piano never covers buttons or text. */
  function dockLayout(main) {
    const dock = main.querySelector(':scope > .piano-dock');
    document.body.classList.toggle('dock-mode', !!dock);
    if (!dock) return;
    const body = el('div.view-scroll');
    Array.from(main.childNodes).forEach(n => { if (n !== dock) body.appendChild(n); });
    main.insertBefore(body, dock);
    fitHeight();
  }

  function fitHeight() {
    if (!document.body.classList.contains('dock-mode')) return;
    const main = document.getElementById('view');
    const tabs = document.querySelector('.tabs');
    const top = main.getBoundingClientRect().top + window.scrollY;
    const bottomNav = getComputedStyle(tabs).position === 'fixed' ? tabs.offsetHeight : 0;
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty('--app-h', Math.max(320, vh - top - bottomNav) + 'px');
  }

  function buildShell() {
    const nav = document.querySelector('.tabs');
    clear(nav);
    NAV.forEach(([key, route, icon]) => {
      nav.appendChild(el('a', { href: '#/' + route, 'data-route': key === 'home' ? 'home' : route },
        el('span.tab-ico', icon), el('span.tab-txt', t('nav.' + key))));
    });
    document.documentElement.lang = ZP.store.setting('lang');
    document.querySelector('.brand-sub').textContent = t('brand.sub');
    document.querySelector('.gear').setAttribute('aria-label', t('nav.settings'));
    document.querySelector('.foot').textContent = t('footer');
    updateHud();
  }

  function updateHud() {
    const s = ZP.store.state;
    const li = ZP.store.levelInfo();
    const lang = ZP.store.setting('lang');
    const hud = document.querySelector('.hud');
    clear(hud);
    hud.appendChild(el('a.hud-level', { href: '#/stickers', title: li.title[lang] },
      el('span.lvl-num', String(li.level)),
      el('span.lvl-box',
        el('span.lvl-title', li.title[lang]),
        el('span.xpbar', el('span.xpfill', { style: { width: Math.round(li.progress * 100) + '%' } })))));
    hud.appendChild(el('span.hud-chip', { title: t('hud.stars') }, '⭐ ' + ZP.store.totalStars()));
    hud.appendChild(el('span.hud-chip' + (s.streak.last === ZP.store.today() ? '.hot' : ''), { title: t('hud.streak') }, '🔥 ' + (s.streak.count || 0)));
  }

  function celebrate() {
    ZP.bus.on('xp', d => {
      updateHud();
      if (d.amount > 0) ZP.fx.toast('+' + d.amount + ' XP ✨', 'xp');
    });
    ZP.bus.on('levelup', li => {
      updateHud();
      const lang = ZP.store.setting('lang');
      // wait until the song-result popup is closed so popups don't stack
      const show = () => {
        if (document.querySelector('.modal-wrap')) return setTimeout(show, 500);
        ZP.audio.jingle('level');
        ZP.fx.confetti(180);
        ZP.fx.modal([
          ZP.fx.mascot('wow', 110),
          el('h2', t('levelup.title', { n: li.level })),
          el('p.big', li.title[lang]),
          el('button.btn.primary', { onclick: e => e.target.closest('.modal-wrap').click() }, t('yay'))
        ], { cls: 'celebrate' });
      };
      setTimeout(show, 900);
    });
    ZP.bus.on('sticker', s => {
      const lang = ZP.store.setting('lang');
      setTimeout(() => {
        ZP.fx.toast('<span class="toast-emoji">' + s.emoji + '</span> ' + t('sticker.new') + ': <b>' + s[lang] + '</b>', 'stk');
        ZP.fx.confetti(60);
      }, 400);
      updateHud();
    });
    ZP.bus.on('settings', s => {
      if (s.key === 'lang') { buildShell(); render(); }
      if (s.key === 'volume') ZP.audio.setVolume(s.value);
    });
    ZP.bus.on('reset', () => { buildShell(); render(); });
  }

  function init() {
    ZP.input.init();
    buildShell();
    celebrate();
    window.addEventListener('hashchange', render);
    window.addEventListener('resize', fitHeight);
    window.addEventListener('orientationchange', () => setTimeout(fitHeight, 300));
    if (window.visualViewport) window.visualViewport.addEventListener('resize', fitHeight);
    // first interaction unlocks audio on iOS / Chrome autoplay policy
    const unlock = () => { ZP.audio.ensure(); window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    render();
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
      // when a new version of the app takes over, reload once so the whole page is up to date
      const hadController = !!navigator.serviceWorker.controller;
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (hadController && !reloaded) { reloaded = true; location.reload(); }
      });
      navigator.serviceWorker.register('sw.js').catch(() => { /* offline mode unavailable */ });
    }
  }

  ZP.app = { render, updateHud, buildShell };
  document.addEventListener('DOMContentLoaded', init);
})(window.ZP);
