/* Stickers & level page, and settings / parents corner. */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';
  const { el } = ZP.util;
  const t = (k, v) => ZP.i18n.t(k, v);

  ZP.views.stickers = function (root) {
    const lang = ZP.store.setting('lang');
    const s = ZP.store.state;
    const li = ZP.store.levelInfo();
    root.appendChild(ZP.ui.head('🏅 ' + t('nav.stickers')));
    root.appendChild(el('div.card.level-card',
      ZP.fx.mascot('happy', 90),
      el('div',
        el('small', t('level') + ' ' + li.level),
        el('h2', li.title[lang]),
        el('div.xpbar.big', el('span.xpfill', { style: { width: Math.round(li.progress * 100) + '%' } })),
        el('p.muted', li.toNext ? t('stick.toNext', { n: li.toNext }) : t('stick.max')))));
    const got = Object.keys(s.stickers).length;
    root.appendChild(el('div.stats-row',
      el('div.stat', el('b', String(s.xp)), el('small', 'XP')),
      el('div.stat', el('b', String(ZP.store.totalStars())), el('small', t('hud.stars'))),
      el('div.stat', el('b', String(s.streak.count || 0)), el('small', t('hud.streak'))),
      el('div.stat', el('b', String(s.stats.notes)), el('small', t('stick.notes'))),
      el('div.stat', el('b', got + '/' + ZP.store.STICKERS.length), el('small', t('nav.stickers')))));
    root.appendChild(el('div.sticker-grid', ZP.store.STICKERS.map(st => {
      const has = !!s.stickers[st.id];
      return el('div.sticker' + (has ? '.got' : ''), { title: lang === 'tr' ? st.dtr : st.den },
        el('span.sticker-emoji', has ? st.emoji : '❔'),
        el('b', st[lang]),
        el('small', lang === 'tr' ? st.dtr : st.den));
    })));
    root.appendChild(el('h2', '🪜 ' + t('stick.levels')));
    root.appendChild(el('ol.level-list', ZP.store.LEVELS.map((l, i) =>
      el('li' + (i + 1 <= li.level ? '.got' : ''), el('b', (i + 1) + '. ' + l[lang]), el('small', l.xp + ' XP')))));
  };

  ZP.views.settings = function (root) {
    root.appendChild(ZP.ui.head('⚙️ ' + t('nav.settings')));

    function select(key, options) {
      const s = el('select.inp', { onchange: e => ZP.store.setting(key, e.target.value) },
        options.map(([v, label]) => el('option', { value: v, selected: ZP.store.setting(key) === v }, label)));
      return s;
    }
    function toggle(key) {
      return el('input', { type: 'checkbox', checked: !!ZP.store.setting(key), onchange: e => ZP.store.setting(key, e.target.checked) });
    }
    const vol = el('input', { type: 'range', min: '0', max: '1', step: '0.05', value: String(ZP.store.setting('volume')) });
    vol.addEventListener('input', () => ZP.store.setting('volume', parseFloat(vol.value)));
    vol.addEventListener('change', () => ZP.audio.play('G4'));
    const lat = el('input.inp.short', { type: 'number', min: '0', max: '400', step: '10', value: String(ZP.store.setting('micLatency')) });
    lat.addEventListener('change', () => ZP.store.setting('micLatency', Math.max(0, Math.min(400, +lat.value || 0))));

    root.appendChild(el('div.card.settings',
      el('h2', '🎨 ' + t('set.general')),
      el('label.set-row', el('span', '🌍 ' + t('set.lang')), select('lang', [['en', 'English'], ['tr', 'Türkçe']])),
      el('label.set-row', el('span', '🔤 ' + t('set.labels')), select('labels', [['letters', 'C D E (' + t('set.letters') + ')'], ['solfege', 'Do Re Mi'], ['none', t('set.none')]])),
      el('label.set-row', el('span', '🔊 ' + t('set.sound')), select('sound', ['toy', 'musicbox', 'piano', 'xylo', 'chip'].map(p => [p, t('sound.' + p)]))),
      el('label.set-row', el('span', '🔉 ' + t('set.volume')), vol),
      el('label.set-row', el('span', '🗣️ ' + t('set.speak')), toggle('speak')),
      el('label.set-row', el('span', '⌨️ ' + t('set.kbd')), toggle('showKbd'))));

    root.appendChild(el('div.card.settings',
      el('h2', '🎤 ' + t('set.mic')),
      el('p.muted', t('set.micText')),
      el('label.set-row', el('span', t('set.latency')), lat),
      el('a.btn', { href: '#/helper' }, '🔧 ' + t('cal.title'))));

    root.appendChild(el('div.card.settings',
      el('h2', '👨‍👩‍👧 ' + t('set.parents')),
      el('ul.tips', t('set.tips').split('|').map(x => el('li', x))),
      el('label.set-row', el('span', '🔓 ' + t('set.unlock')), toggle('unlockAll')),
      el('div.btn-row',
        el('button.btn', { onclick: () => {
          const blob = new Blob([ZP.store.exportJSON()], { type: 'application/json' });
          const a = el('a', { href: URL.createObjectURL(blob), download: 'little-pianist-progress.json' });
          document.body.appendChild(a); a.click(); a.remove();
        } }, '⬇️ ' + t('set.export')),
        el('label.btn', '⬆️ ' + t('set.import'), el('input', { type: 'file', accept: 'application/json', hidden: true, onchange: e => {
          const f = e.target.files[0];
          if (!f) return;
          f.text().then(txt => { ZP.store.importJSON(txt); ZP.fx.toast('✅ ' + t('set.imported')); }).catch(() => ZP.fx.toast(t('set.importErr'), 'warn'));
        } })),
        el('button.btn.danger', { onclick: () => { if (confirm(t('set.resetConfirm'))) ZP.store.reset(); } }, '🗑️ ' + t('set.reset')))));

    root.appendChild(el('div.card.settings',
      el('h2', 'ℹ️ ' + t('set.about')),
      el('p', t('set.aboutText')),
      el('p.muted.small', t('footer'))));
  };
})(window.ZP);
