'use client';
import { useEffect, useRef } from 'react';
import { scene } from '@/lib/scene';

const fmt = (n: number, d: number) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

// Hovering the live landscape shows the real price level under the cursor.
export default function BookReadout() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let x = 0, y = 0, blocked = true, raf = 0, last = '';
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      const t = e.target as Element | null;
      // stay out of the way of the name, the copy and the buttons
      blocked = !t?.closest('#home') || !!t.closest('h1, .say, .acts, .now, .eyebrow, a, button');
    };
    addEventListener('pointermove', move, { passive: true });
    const loop = () => {
      const node = el.current, h = scene.hover, b = scene.book;
      if (node) {
        if (h && b.live && !blocked && scene.shape === 'depth') {
          const bid = h.side === 'bid', p = (bid ? b.bp : b.ap)[h.lvl], q = (bid ? b.bq : b.aq)[h.lvl], c = (bid ? b.bc : b.ac)[h.lvl];
          const txt = `${h.side} · level ${h.lvl + 1}|${fmt(p, 2)}|${fmt(q, 4)} BTC · ${fmt(c, 3)} BTC to here`;
          if (txt !== last) {
            const [a, pr, rest] = txt.split('|');
            node.innerHTML = `<span class="k ${h.side}">${a}</span><b>${pr}</b><span>${rest}</span>`;
            last = txt;
          }
          node.style.transform = `translate(${x + 18}px, ${y + 16}px)`;
          node.dataset.on = '1';
        } else node.dataset.on = '0';
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener('pointermove', move); };
  }, []);
  return <div className="readout-tip" ref={el} aria-hidden="true" data-on="0" />;
}
