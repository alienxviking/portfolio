'use client';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { WORDS } from '@/lib/data';
import { startGrains } from '@/lib/grains';
import CopyEmail from './CopyEmail';
import { MagneticLink } from './Magnetic';

const EASE = [0.22, 1, 0.36, 1] as const;

function RotatingWord() {
  const [i, setI] = useState(0);
  const [w, setW] = useState<number | 'auto'>('auto');
  const measure = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % WORDS.length), 2600);
    return () => clearInterval(id);
  }, []);
  useLayoutEffect(() => { if (measure.current) setW(measure.current.offsetWidth); }, [i]);
  return (
    <motion.span className="rot" animate={{ width: w }} transition={{ type: 'spring', stiffness: 260, damping: 30 }}>
      <span ref={measure} aria-hidden="true" style={{ visibility: 'hidden', position: 'absolute' }}>{WORDS[i]}</span>
      <AnimatePresence initial={false}>
        <motion.span key={WORDS[i]} initial={{ y: '100%', opacity: 0, filter: 'blur(6px)' }} animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-100%', opacity: 0, filter: 'blur(6px)' }} transition={{ duration: 0.55, ease: EASE }}>{WORDS[i]}</motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

export default function Hero() {
  const h1 = useRef<HTMLHeadingElement>(null), cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!h1.current || !cv.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    return startGrains(h1.current, cv.current, { intro: true });
  }, []);
  const up = (d: number) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: EASE, delay: d } });
  return (
    <section className="hero" id="home">
      <div className="w">
        <motion.div className="lbl eyebrow" {...up(0.1)}>Systems + AI engineer · Bengaluru</motion.div>
        <h1 ref={h1} aria-label="Snehangshu Roy">
          <span className="nm" aria-hidden="true"><span className="wd">Snehangshu</span> <span className="wd">Roy</span></span>
          <canvas ref={cv} className="namefx" aria-hidden="true" />
        </h1>
        <div className="hero-foot">
          <motion.div {...up(0.35)}>
            <p className="say">I build <RotatingWord /><br />that prove they work.</p>
            <div className="acts">
              <MagneticLink className="b p" href="#work">
                See the work
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
              </MagneticLink>
              <CopyEmail />
            </div>
          </motion.div>
          <motion.div className="now" {...up(0.5)}>
            <span className="lbl">Now</span>
            <p>Taking <b>quant</b> from paper trading to live orders. The bar for done: my record and the exchange&apos;s agree exactly, for every order.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
