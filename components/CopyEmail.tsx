'use client';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { SITE } from '@/lib/data';
import { useMagnet } from './Magnetic';

const POP = { type: 'spring', stiffness: 500, damping: 26 } as const;

export default function CopyEmail({ primary = false }: { primary?: boolean }) {
  const [state, setState] = useState<'idle' | 'copied' | 'select'>('idle');
  const m = useMagnet();
  const copy = async () => {
    try { await navigator.clipboard.writeText(SITE.email); setState('copied'); }
    catch {
      const el = document.getElementById('addr');
      if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s?.removeAllRanges(); s?.addRange(r); }
      setState('select');
    }
    setTimeout(() => setState('idle'), 1800);
  };
  return (
    <>
      <motion.button type="button" className={'b' + (primary ? ' p' : '')} onClick={copy} style={m.style} onPointerMove={m.onPointerMove} onPointerLeave={m.onPointerLeave}>
        <span className="ic">
          <AnimatePresence initial={false} mode="popLayout">
            {state === 'copied' ? (
              <motion.svg key="ok" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={POP}>
                <motion.path d="M3.5 8.5l3 3 6-7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, ease: 'easeOut' }} />
              </motion.svg>
            ) : (
              <motion.svg key="copy" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={POP}>
                <rect x="5" y="5" width="8" height="8" rx="2" /><path d="M3 10.5V4a1 1 0 0 1 1-1h6.5" />
              </motion.svg>
            )}
          </AnimatePresence>
        </span>
        <span>{state === 'copied' ? 'Copied' : state === 'select' ? 'Press Ctrl+C' : 'Copy email'}</span>
      </motion.button>
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {state === 'copied' && (
            <motion.div className="toast" role="status" initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }} transition={POP}>
              Email copied
            </motion.div>
          )}
        </AnimatePresence>, document.body)}
    </>
  );
}
