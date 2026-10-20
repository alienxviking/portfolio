'use client';
import { motion } from 'motion/react';

// Each route fades and lifts in. transform/filter are cleared afterwards so
// position: fixed and sticky children behave normally.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { transform: 'none', filter: 'none' } }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
