'use client';
import { useEffect, useRef } from 'react';
import { startEngine } from '@/lib/engine';

export default function Field() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let stop: (() => void) | undefined;
    try { stop = startEngine(ref.current, { small: innerWidth < 900, reduce }); } catch { /* no WebGL: the page still reads fine */ }
    return () => stop?.();
  }, []);
  return (
    <>
      <canvas ref={ref} className="gl" aria-hidden="true" />
      <div className="shade" aria-hidden="true" />
    </>
  );
}
