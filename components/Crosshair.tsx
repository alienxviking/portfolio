'use client';
import { useEffect, useRef } from 'react';
import { scene } from '@/lib/scene';

const fmt = (n: number, d: number) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

// A trading-terminal crosshair over the live book: hairlines to the edges of the hero,
// the level's price where the vertical line meets the top, the depth to here on the horizontal,
// and next to the pointer what a click would do. Pinned to the pointer, no easing, so it never lags.
export default function Crosshair() {
  const root = useRef<HTMLDivElement>(null), labels = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current, lb = labels.current, home = document.getElementById('home');
    if (!el || !lb || !home || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const [hl, vl] = Array.from(el.children) as HTMLElement[], [price, depth, tag] = Array.from(lb.children) as HTMLElement[];
    let x = 0, y = 0, blocked = true, raf = 0, on = false, lit = false, last = '';
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      const t = e.target as Element | null;
      // stay out of the way of the copy and the buttons; the name is drawn over the book, so it counts as book
      blocked = !t?.closest('#home') || !!t.closest('.say, .acts, .now, .eyebrow, a, button');
    };
    const out = (e: PointerEvent) => { if (!e.relatedTarget) blocked = true; };
    addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerout', out);
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const h = scene.hover, b = scene.book, now = !blocked && b.live && scene.shape === 'depth';
      if (now !== on) { on = now; el.dataset.on = lb.dataset.on = on ? '1' : '0'; home.style.cursor = on ? 'crosshair' : ''; }
      if (!on) return;
      const r = home.getBoundingClientRect(), top = Math.max(r.top, 0);
      hl.style.transform = `translate3d(0,${y}px,0)`; hl.style.setProperty('--x', `${x}px`);
      vl.style.transform = `translate3d(${x}px,${r.top}px,0)`; vl.style.height = `${r.height}px`; vl.style.setProperty('--y', `${y - r.top}px`);
      if (h) {
        const bid = h.side === 'bid', p = (bid ? b.bp : b.ap)[h.lvl], c = (bid ? b.bc : b.ac)[h.lvl];
        const txt = `${h.side} L${h.lvl + 1} · ${fmt(p, 2)}|${fmt(c, 3)} BTC to here|click: ${bid ? 'sell' : 'buy'} ${fmt(c, 3)} BTC`;
        if (txt !== last) {
          const [a, d, k] = txt.split('|');
          price.textContent = a; price.dataset.side = h.side; depth.textContent = d; tag.textContent = k; last = txt;
        }
        price.style.transform = `translate3d(${x}px,${top + 84}px,0) translateX(-50%)`;
        depth.style.transform = `translate3d(0,${y}px,0) translateY(-50%)`;
        tag.style.transform = `translate3d(${x + 16}px,${y + 16}px,0)`;
      }
      if (!!h !== lit) { lit = !!h; lb.dataset.lit = lit ? '1' : '0'; }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf); removeEventListener('pointermove', move); document.removeEventListener('pointerout', out);
      home.style.cursor = '';
    };
  }, []);
  return (
    <>
      <div className="xh" ref={root} aria-hidden="true" data-on="0"><i className="xh-h" /><i className="xh-v" /></div>
      <div className="xl" ref={labels} aria-hidden="true" data-on="0" data-lit="0"><span className="xh-p" /><span className="xh-d" /><span className="xh-t" /></div>
    </>
  );
}
