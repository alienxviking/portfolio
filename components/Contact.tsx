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
        <motion.div className="mailrow" {...rise}>
          <span className="addr" id="addr">{SITE.email}</span>
          <CopyEmail primary />
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
