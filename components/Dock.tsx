'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';

const ITEMS = [
  ['home', 'Home'], ['about', 'About'], ['work', 'Work'], ['projects', 'Projects'], ['contact', 'Contact'],
] as const;
const SPRING = { type: 'spring', stiffness: 420, damping: 36 } as const;

export default function Dock() {
  const path = usePathname();
  const onHome = path === '/';
  const [active, setActive] = useState<string>(onHome ? 'home' : 'work');
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    if (!onHome) { setActive('work'); return; }
    const update = () => {
      const mid = innerHeight * 0.45; let best = 'home';
      ITEMS.forEach(([id]) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < mid) best = id; });
      setActive(best);
    };
    update();
    document.addEventListener('scroll', update, { passive: true, capture: true });
    return () => document.removeEventListener('scroll', update, { capture: true });
  }, [onHome]);

  return (
    <nav className="dock" aria-label="Sections" onPointerLeave={() => setHover(null)}>
      {ITEMS.map(([id, label]) => {
        const inner: ReactNode = (
          <>
            {hover === id && active !== id && <motion.span layoutId="dock-hover" className="pill hov" transition={SPRING} />}
            {active === id && <motion.span layoutId="dock-active" className="pill act" transition={SPRING} />}
            <span>{label}</span>
          </>
        );
        const cls = active === id ? 'on' : '';
        return onHome
          ? <a key={id} href={`#${id}`} className={cls} onPointerEnter={() => setHover(id)}>{inner}</a>
          : <Link key={id} href={`/#${id}`} className={cls} onPointerEnter={() => setHover(id)}>{inner}</Link>;
      })}
    </nav>
  );
}
