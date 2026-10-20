'use client';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { useRef, useState } from 'react';
import { MORE } from '@/lib/data';
import { useScrambleInView } from './useScramble';

const Arrow = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M5 11L11 5M6 5h5v5" /></svg>;

export default function MoreWork() {
  const h2 = useRef<HTMLHeadingElement>(null);
  useScrambleInView(h2);
  const [hov, setHov] = useState<number | null>(null);
  const [onLink, setOnLink] = useState(false);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 30 }), sy = useSpring(y, { stiffness: 300, damping: 30 });
  const m = hov === null ? null : MORE[hov];

  return (
    <section className="idx" id="projects" onPointerMove={(e) => { x.set(e.clientX + 22); y.set(e.clientY + 18); }}>
      <div className="w">
        <div className="sh">
          <h2 ref={h2}>More projects</h2>
          <span className="lbl">Eight smaller builds · hover for a preview</span>
        </div>
        <div className="rows">
          {MORE.map((p, i) => (
            <motion.div key={p.name} className="row" initial={{ opacity: 0.35, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }}
              transition={{ type: 'spring', stiffness: 160, damping: 22, delay: i * 0.03 }}
              onPointerEnter={(e) => { if (e.pointerType === 'mouse') { if (hov === null) { x.jump(e.clientX + 22); y.jump(e.clientY + 18); } setHov(i); } }}
              onPointerLeave={() => setHov(null)}>
              <span className="i">{String(i + 5).padStart(2, '0')}</span>
              <h3><a href={p.live ?? p.code} target="_blank" rel="noopener noreferrer" onPointerEnter={() => setOnLink(true)} onPointerLeave={() => setOnLink(false)}>{p.name}</a></h3>
              <p>{p.desc}</p>
              <span className="t">{p.tech}</span>
              <span className="go">
                {p.live && <a className="lk" href={p.live} target="_blank" rel="noopener noreferrer" onPointerEnter={() => setOnLink(true)} onPointerLeave={() => setOnLink(false)}>Live <Arrow /></a>}
                <a className="lk" href={p.code} target="_blank" rel="noopener noreferrer" onPointerEnter={() => setOnLink(true)} onPointerLeave={() => setOnLink(false)}>Code <Arrow /></a>
              </span>
            </motion.div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {m && !onLink && (
          <motion.div className="peek" aria-hidden="true" style={{ x: sx, y: sy, ['--pc' as string]: m.acc }}
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ type: 'spring', stiffness: 420, damping: 32 }}>
            <div className="pi">
              <AnimatePresence initial={false}>
                <motion.img key={m.shot} src={`/shots/${m.shot}.jpg`} alt="" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />
              </AnimatePresence>
            </div>
            <div className="pt"><i /><span>{m.name}</span></div>
            <div className="ps">{m.tech}</div>
            <div className="pl">{m.live ? 'Live demo + source' : 'Source on GitHub'}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
