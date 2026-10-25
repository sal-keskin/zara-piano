/* Small shared helpers: event bus, DOM builder, misc. */
window.ZP = window.ZP || {};
(function (ZP) {
  'use strict';

  const handlers = {};
  ZP.bus = {
    on(name, fn) {
      (handlers[name] = handlers[name] || []).push(fn);
      return () => ZP.bus.off(name, fn);
    },
    off(name, fn) {
      const list = handlers[name];
      if (list) handlers[name] = list.filter(f => f !== fn);
    },
    emit(name, data) {
      (handlers[name] || []).slice().forEach(fn => {
        try { fn(data); } catch (e) { console.error(e); }
      });
    }
  };

  // el('div.card#main', {onclick, attrs...}, children...)
  function el(sel, props, ...kids) {
    const m = /^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i.exec(sel) || [];
    const node = document.createElement(m[1] || 'div');
    (m[2] || '').replace(/([.#])([\w-]+)/g, (_, t, v) => {
      if (t === '.') node.classList.add(v); else node.id = v;
    });
    if (props && (typeof props !== 'object' || props instanceof Node || Array.isArray(props))) {
      kids.unshift(props);
      props = null;
    }
    if (props) {
      Object.keys(props).forEach(k => {
        const v = props[k];
        if (v === undefined || v === null || v === false) return;
        if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') Object.keys(v).forEach(sk => (sk.startsWith('--') ? node.style.setProperty(sk, v[sk]) : (node.style[sk] = v[sk])));
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'text') node.textContent = v;
        else if (k in node && k !== 'list' && typeof v !== 'string') node[k] = v;
        else node.setAttribute(k, v === true ? '' : v);
      });
    }
    append(node, kids);
    return node;
  }

  function append(node, kids) {
    kids.forEach(k => {
      if (k === null || k === undefined || k === false) return;
      if (Array.isArray(k)) append(node, k);
      else node.appendChild(k instanceof Node ? k : document.createTextNode(String(k)));
    });
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  const wait = ms => new Promise(r => setTimeout(r, ms));

  // Creates a cancellable scope: timers + bus listeners are cleaned up together.
  function scope() {
    const offs = [];
    const timers = new Set();
    let alive = true;
    return {
      get alive() { return alive; },
      on(name, fn) { offs.push(ZP.bus.on(name, fn)); },
      listen(target, ev, fn, opts) { target.addEventListener(ev, fn, opts); offs.push(() => target.removeEventListener(ev, fn, opts)); },
      add(fn) { offs.push(fn); },
      timeout(fn, ms) { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); return id; },
      wait(ms) { return new Promise(r => this.timeout(r, ms)); },
      clearTimers() { timers.forEach(clearTimeout); timers.clear(); },
      dispose() { alive = false; timers.forEach(clearTimeout); timers.clear(); offs.splice(0).forEach(f => { try { f(); } catch (e) { console.error(e); } }); }
    };
  }

  function starsText(n, max) {
    max = max || 3;
    let s = '';
    for (let i = 0; i < max; i++) s += i < n ? '★' : '☆';
    return s;
  }

  ZP.util = { el, clear, shuffle, pick, wait, scope, starsText };
})(window.ZP);
