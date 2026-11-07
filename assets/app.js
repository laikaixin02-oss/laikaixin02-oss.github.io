/* ============================================================
   作品档案 — behaviour
   A board of five pinned works. Every card is a plain link:
   clicking opens the work itself. No modal, no extra chrome.
   ============================================================ */
(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- entrance ---------- */
  const cards = $$('.card');
  cards.forEach((card, i) => card.style.setProperty('--d', `${0.12 + i * 0.09}s`));
  requestAnimationFrame(() => document.body.classList.add('is-ready'));

  /* ---------- red threads ---------- */
  const board = $('#board');
  const svg   = $('#threads');

  // id pairs — the order the threads are "strung up"
  const LINKS = [
    ['kart', 'bag'],
    ['bag', 'shrine'],
    ['shrine', 'threads'],
    ['threads', 'volley'],
    ['volley', 'kart']
  ];

  function pinPoints() {
    const b = board.getBoundingClientRect();
    const pts = {};
    $$('.card', board).forEach(card => {
      const pin = $('.pin', card);
      if (!pin) return;
      const r = pin.getBoundingClientRect();
      pts[card.dataset.id] = {
        x: r.left - b.left + r.width / 2,
        y: r.top - b.top + r.height / 2
      };
    });
    return pts;
  }

  function sagPath(a, b, sag, bow) {
    const mx = (a.x + b.x) / 2 + bow;
    const my = (a.y + b.y) / 2 + sag;
    return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }

  let threadDrawn = false;

  function drawThreads(animate) {
    if (!board || !svg) return;
    if (window.matchMedia('(max-width: 980px)').matches) { svg.innerHTML = ''; return; }

    const w = board.clientWidth;
    const h = board.clientHeight;
    if (!w || !h) return;

    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('preserveAspectRatio', 'none');

    const pts = pinPoints();
    const ns = 'http://www.w3.org/2000/svg';
    svg.innerHTML = '';

    LINKS.forEach(([a, b], idx) => {
      const A = pts[a], B = pts[b];
      if (!A || !B) return;

      const d = sagPath(A, B, 18 + (idx % 3) * 7, (idx % 2 ? 1 : -1) * (6 + idx * 2));

      const shadow = document.createElementNS(ns, 'path');
      shadow.setAttribute('d', d);
      shadow.setAttribute('class', 'thread thread--shadow');
      const line = document.createElementNS(ns, 'path');
      line.setAttribute('d', d);
      line.setAttribute('class', 'thread');
      const light = document.createElementNS(ns, 'path');
      light.setAttribute('d', d);
      light.setAttribute('class', 'thread thread--light');

      [shadow, line, light].forEach(p => {
        p.setAttribute('pathLength', '1');
        p.style.strokeDasharray = '1';
        p.style.strokeDashoffset = animate && !RM ? '1' : '0';
        svg.appendChild(p);
      });

      if (animate && !RM) {
        const delay = 620 + idx * 130;
        [shadow, line, light].forEach((p, i) => {
          p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
            duration: 900 + i * 60,
            delay,
            easing: 'cubic-bezier(.35,.7,.35,1)',
            fill: 'forwards'
          });
        });
      }

      if (!threadDrawn) {
        [A, B].forEach(P => {
          const k = document.createElementNS(ns, 'circle');
          k.setAttribute('cx', P.x); k.setAttribute('cy', P.y);
          k.setAttribute('r', '2.3'); k.setAttribute('class', 'knot');
          svg.appendChild(k);
        });
      }
    });

    threadDrawn = true;
  }

  if (board) {
    const start = () => {
      drawThreads(!RM);
      setTimeout(() => drawThreads(false), 1900);
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });

    let raf = 0;
    const redraw = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => drawThreads(false));
    };
    window.addEventListener('resize', redraw, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw).catch(() => {});
  }

  /* ---------- cursor spotlight ---------- */
  const spot = $('#spot');
  if (spot && window.matchMedia('(hover:hover)').matches && !RM) {
    let sx = 50, sy = 26, rafSpot = 0;
    window.addEventListener('pointermove', e => {
      sx = (e.clientX / window.innerWidth) * 100;
      sy = (e.clientY / window.innerHeight) * 100;
      if (rafSpot) return;
      rafSpot = requestAnimationFrame(() => {
        spot.style.setProperty('--mx', `${sx}%`);
        spot.style.setProperty('--my', `${sy}%`);
        rafSpot = 0;
      });
    }, { passive: true });
  }
})();
