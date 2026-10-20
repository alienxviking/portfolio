'use client';
import { motion, useMotionValue, useSpring } from 'motion/react';
import type { ComponentProps, PointerEvent } from 'react';

// Wraps a button or link so it leans toward the cursor and springs back.
export function useMagnet(strength = 0.25) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.6 }), sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.6 });
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength); y.set((e.clientY - r.top - r.height / 2) * strength * 1.3);
  };
  const onPointerLeave = () => { x.set(0); y.set(0); };
  return { style: { x: sx, y: sy }, onPointerMove, onPointerLeave };
}

export function MagneticLink(props: ComponentProps<typeof motion.a>) {
  const m = useMagnet();
  return <motion.a {...props} style={m.style} onPointerMove={m.onPointerMove} onPointerLeave={m.onPointerLeave} />;
}
