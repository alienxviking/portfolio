'use client';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

export type Line = { t: string; kind?: 'cmd' | 'ok' | 'dim' | 'blank' };

// A terminal window whose lines appear one after another when it scrolls into view.
export default function Terminal({ title, note, lines }: { title: string; note: string; lines: Line[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <div className="term" ref={ref}>
      <div className="term-bar"><i /><i /><i /><span>{title}</span></div>
      <pre className="term-body" aria-label={lines.map((l) => l.t).join('\n')}>
        {lines.map((l, i) => (
          <motion.span key={i} className={'tl ' + (l.kind ?? '')} initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }}
            transition={{ duration: 0.18, delay: inView ? i * (l.kind === 'cmd' ? 0.12 : 0.05) + (l.kind === 'cmd' ? 0.25 : 0) : 0 }}>
            {l.kind === 'cmd' && <b>$ </b>}{l.t || ' '}{'\n'}
          </motion.span>
        ))}
      </pre>
      <p className="term-note">{note}</p>
    </div>
  );
}
