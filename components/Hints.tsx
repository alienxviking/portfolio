'use client';
import { useEffect, useRef } from 'react';

// A small label beside the pointer for things that can be clicked but don't look like buttons.
// Mark them with data-hint="…". Real buttons and links never get one.
export default function Hints() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let x = -1, y = -1, raf = 0, shown = false;
    const update = () => {
      raf = 0;
      const node = el.current; if (!node || x < 0) return;
      const t = document.elementFromPoint(x, y), h = t?.closest<HTMLElement>('[data-hint]');
      const show = !!h && !t?.closest('a, button, .ctl');
      if (show) {
        if (node.textContent !== h!.dataset.hint) node.textContent = h!.dataset.hint!;
        node.style.transform = `translate3d(${x + 16}px,${y + 16}px,0)`;
      }
      if (show !== shown) { shown = show; node.dataset.on = show ? '1' : '0'; }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    const move = (e: PointerEvent) => { x = e.clientX; y = e.clientY; schedule(); };
    const out = (e: PointerEvent) => { if (!e.relatedTarget) { x = -1; if (el.current) { el.current.dataset.on = '0'; shown = false; } } };
    // the hint text can change while the pointer rests (after a click, or when a run finishes): re-read while one is showing
    const click = () => setTimeout(schedule, 30);
    const poll = setInterval(() => { if (shown) schedule(); }, 250);
    addEventListener('pointermove', move, { passive: true });
    document.addEventListener('scroll', schedule, { passive: true, capture: true });
    document.addEventListener('pointerout', out);
    addEventListener('click', click);
    return () => {
      cancelAnimationFrame(raf); clearInterval(poll); removeEventListener('pointermove', move); removeEventListener('click', click);
      document.removeEventListener('scroll', schedule, { capture: true }); document.removeEventListener('pointerout', out);
    };
  }, []);
  return <div className="hint" ref={el} aria-hidden="true" data-on="0" />;
}
