/* Home: greeting, next lesson, song of the day, menu and the "how to use with your piano" guide. */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';
  const { el } = ZP.util;
  const t = (k, v) => ZP.i18n.t(k, v);
  const tx = o => ZP.i18n.tx(o);

  // shared helpers for all views
  ZP.ui = {
    head(title, back, extra) {
      return el('div.page-head',
        back ? el('a.back', { href: back, 'aria-label': t('back') }, '←') : null,
        el('h1', title),
        extra || null);
    },
    findSong(id) {
      if (id && id.startsWith('my-')) {
        const s = ZP.store.state.custom.find(c => c.id === id);
        return s || null;
      }
      return ZP.songs.SONGS.find(s => s.id === id) || null;
    },
    difficulty(song) {
      const c = ZP.songs.compile(song);
      const span = Math.max(...c.keysUsed.map(k => ZP.notes.BY_ID[k].midi)) - Math.min(...c.keysUsed.map(k => ZP.notes.BY_ID[k].midi));
      let d = 1;
      if (c.keysUsed.length > 4) d++;
      if (span > 7 || c.notes.length > 40) d++;
      if (c.hasBlack) d++;
      if (song.world >= 5) d = 5;
      return Math.min(5, d);
    },
    nextLesson() {
      return ZP.lessons.LESSONS.find(l => !ZP.store.state.lessons[l.id]) || null;
    }
  };

  function greeting() {
    const h = new Date().getHours();
    return t(h < 12 ? 'home.morning' : h < 18 ? 'home.afternoon' : 'home.evening');
  }

  ZP.views.home = function (root) {
    const li = ZP.store.levelInfo();
    const lang = ZP.store.setting('lang');
    const next = ZP.ui.nextLesson();
    const daily = ZP.ui.findSong(ZP.store.dailySongId());
    const dailyDone = ZP.store.state.daily === ZP.store.today();

    root.appendChild(el('section.hero',
      ZP.fx.bubble('happy', '<b>' + greeting() + '</b><br>' + t('home.intro', { title: li.title[lang] })),
    ));

    const cards = el('section.cards3');
    if (next) {
      const idx = ZP.lessons.LESSONS.indexOf(next) + 1;
      cards.appendChild(el('a.card.big-card.c-sage', { href: '#/lesson/' + next.id },
        el('div.card-kicker', t('home.continue')),
        el('div.card-emoji', next.emoji),
        el('h3', t('learn.lesson') + ' ' + idx + ': ' + tx(next.title)),
        el('span.btn.primary', t('start') + ' ▶')));
    } else {
      cards.appendChild(el('a.card.big-card.c-sage', { href: '#/songs' },
        el('div.card-kicker', t('home.allLessons')),
        el('div.card-emoji', '🏅'),
        el('h3', t('home.keepPlaying')),
        el('span.btn.primary', t('nav.songs') + ' ▶')));
    }
    if (daily) {
      cards.appendChild(el('a.card.big-card.c-gold', { href: '#/song/' + daily.id },
        el('div.card-kicker', t('home.daily') + (dailyDone ? ' ✅' : ' · +50 XP')),
        el('div.card-emoji', daily.emoji),
        el('h3', tx(daily.title)),
        el('div.stars', ZP.util.starsText(ZP.store.songStars(daily.id))),
        el('span.btn.primary', t('play') + ' ▶')));
    }
    cards.appendChild(el('a.card.big-card.c-terra', { href: '#/helper' },
      el('div.card-kicker', t('home.realPiano')),
      el('div.card-emoji', '🎤'),
      el('h3', t('home.helperTitle')),
      el('p', t('home.helperText')),
      el('span.btn.primary', t('open') + ' ▶')));
    root.appendChild(cards);

    const tiles = [
      ['#/learn', '🎓', 'nav.learn', 'home.tile.learn'],
      ['#/songs', '🎶', 'nav.songs', 'home.tile.songs'],
      ['#/games', '🎲', 'nav.games', 'home.tile.games'],
      ['#/free', '🎹', 'nav.free', 'home.tile.free'],
      ['#/stickers', '🏅', 'nav.stickers', 'home.tile.stickers'],
      ['#/chart', '🎨', 'chart.title', 'home.tile.chart']
    ];
    root.appendChild(el('section.tiles', tiles.map(([href, ico, title, sub]) =>
      el('a.tile', { href }, el('span.tile-ico', ico), el('b', t(title)), el('small', t(sub))))));

    // How to use the app with the real piano
    root.appendChild(el('section.card.guide',
      el('h2', '🧭 ' + t('guide.title')),
      el('ol.steps-list',
        el('li', el('span.step-ico', '📱'), el('div', el('b', t('guide.s1')), el('p', t('guide.s1t')))),
        el('li', el('span.step-ico', '🎨'), el('div', el('b', t('guide.s2')), el('p', t('guide.s2t')))),
        el('li', el('span.step-ico', '🐢'), el('div', el('b', t('guide.s3')), el('p', t('guide.s3t')))),
        el('li', el('span.step-ico', '🎤'), el('div', el('b', t('guide.s4')), el('p', t('guide.s4t'))))),
      el('div.mini-piano', ZP.Piano({ interactive: true, compact: true }).el),
      el('p.muted.center', t('guide.try'))));
  };

  // Printable colour chart of all 18 keys
  ZP.views.chart = function (root) {
    const lang = ZP.store.setting('lang');
    root.appendChild(ZP.ui.head('🎨 ' + t('chart.title'), '#/learn',
      el('button.btn', { onclick: () => window.print() }, '🖨️ ' + t('print'))));
    root.appendChild(el('p.muted', t('chart.text')));
    const piano = ZP.Piano({ interactive: true });
    root.appendChild(el('div.card', piano.el));
    const grid = el('div.chart-grid');
    ZP.notes.KEYS.forEach(k => {
      const flat = ZP.notes.flatName(k.id);
      grid.appendChild(el('button.chart-cell' + (k.black ? '.is-black' : ''), {
        type: 'button',
        onclick: () => ZP.input.emit(k.id, 'screen')
      },
      ZP.dot(k.id, 'xl'),
      el('b', k.colorName[lang]),
      el('span', ZP.notes.label(k.id, 'letters') + (flat ? ' / ' + flat : '') + ' · ' + ZP.notes.label(k.id, 'solfege')),
      el('small', (k.black ? t('chart.black') : t('chart.white')) + ' · ' + t('chart.kbd') + ' ' + k.kbd.toUpperCase())));
    });
    root.appendChild(grid);
  };
})(window.ZP);
