'use client';
import { useEffect, type RefObject } from 'react';

const GLY = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghkmnpqrstuvwxyz0123456789#%&*+=<>/';
const KEEP = new Set([' ', '.', '?', "'", ',', '·']);

// Letters cycle through random glyphs and lock in left to right, like a ticker.
export function scramble(el: HTMLElement | null) {
  if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const nodes: Text[] = [];
  const walk = (n: Node) => n.childNodes.forEach((c) => { if (c.nodeType === 3 && c.textContent?.trim()) nodes.push(c as Text); else if (c.nodeType === 1) walk(c); });
  walk(el);
  const start = performance.now();
  nodes.forEach((nd, ni) => {
    const fin = nd.textContent || '', len = fin.length, dur = 380 + len * 16, delay = ni * 120;
    const f = (now: number) => {
      const p = Math.max(0, Math.min(1, (now - start - delay) / dur)), rev = Math.floor(p * len);
      let out = '';
      for (let i = 0; i < len; i++) { const ch = fin[i]; out += i < rev || KEEP.has(ch) ? ch : GLY[(Math.random() * GLY.length) | 0]; }
      nd.textContent = out;
      if (p < 1) requestAnimationFrame(f); else nd.textContent = fin;
    };
    f(start);
  });
}

export function useScrambleInView(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.disconnect(); scramble(el); } }), { threshold: 0.5 });
    io.observe(el); return () => io.disconnect();
  }, [ref]);
}
