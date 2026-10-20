'use client';
import { motion } from 'motion/react';
import { useRef } from 'react';
import { SITE } from '@/lib/data';
import CopyEmail from './CopyEmail';
import { useScrambleInView } from './useScramble';

export default function Contact() {
  const h2 = useRef<HTMLHeadingElement>(null);
  useScrambleInView(h2);
  const rise = { initial: { opacity: 0.35, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.4 }, transition: { type: 'spring', stiffness: 160, damping: 22 } } as const;
  return (
    <section className="contact" id="contact">
      <div className="w">
        <motion.div className="lbl" style={{ marginBottom: 18 }} {...rise}>Contact</motion.div>
        <motion.h2 ref={h2} {...rise}>Have something hard to build? <span>Let&apos;s talk.</span></motion.h2>
        <motion.p className="when" {...rise}>Remote, from Bengaluru · IST (UTC+5:30) · overlaps the European working day and US East Coast mornings</motion.p>
        <motion.div className="mailrow" {...rise}>
          <span className="addr" id="addr">{SITE.email}</span>
          <CopyEmail primary />
          <a className="b" href={SITE.resume} target="_blank" rel="noopener">Download résumé <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2.5v8M4.5 7.5L8 11l3.5-3.5M3 13.5h10" /></svg></a>
        </motion.div>
        <motion.div className="soc" {...rise}>
          <a href={SITE.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href={SITE.x} target="_blank" rel="noopener noreferrer">X</a>
        </motion.div>
      </div>
    </section>
  );
}
