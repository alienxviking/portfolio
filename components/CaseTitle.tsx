'use client';
import { animate } from 'motion';
import { useLayoutEffect, useRef } from 'react';
import { morph } from '@/lib/morph';

// The case-study heading. Arriving from the work stage, a copy of the title flies
// from where it was on the home page into this heading's place.
export default function CaseTitle({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    const h1 = ref.current, from = morph.from;
    morph.from = null;
    if (!h1 || !from || from.text !== text || performance.now() - from.at > 3000 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    h1.style.visibility = 'hidden';
    let clone: HTMLElement | null = null, cancelled = false;
    // wait two frames so the page has settled at the top before measuring
    const id = requestAnimationFrame(() => requestAnimationFrame(() => {
      if (cancelled) return;
      const to = h1.getBoundingClientRect(), cs = getComputedStyle(h1), s = from.fontSize / parseFloat(cs.fontSize);
      clone = document.createElement('div');
      clone.textContent = text;
      Object.assign(clone.style, {
        position: 'fixed', left: to.left + 'px', top: to.top + 'px', margin: '0', zIndex: '60', pointerEvents: 'none', whiteSpace: 'nowrap',
        font: cs.font, letterSpacing: cs.letterSpacing, lineHeight: cs.lineHeight, color: cs.color, transformOrigin: '0 0',
      });
      document.body.appendChild(clone);
      // align the text tops: each box adds half its leading above the glyphs
      const fromLead = (from.rect.height - from.fontSize) / 2, toLead = (to.height - parseFloat(cs.fontSize)) / 2;
      const dx = from.rect.left - to.left, dy = from.rect.top + fromLead - (to.top + toLead * s);
      animate(clone, { x: [dx, 0], y: [dy, 0], scale: [s, 1] }, { type: 'spring', stiffness: 110, damping: 21 })
        .then(() => { h1.style.visibility = ''; clone?.remove(); clone = null; });
    }));
    return () => { cancelled = true; cancelAnimationFrame(id); clone?.remove(); h1.style.visibility = ''; };
  }, [text]);
  return <h1 ref={ref}>{text}</h1>;
}
