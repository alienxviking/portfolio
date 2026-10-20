'use client';
import { useEffect } from 'react';
import { FEATURED } from '@/lib/data';
import { scene, type Shape } from '@/lib/scene';

// Home page: pick the particle shape from whichever section sits under the middle of the screen.
export function HomeDirector() {
  useEffect(() => {
    scene.dim = 1;
    const ids: [string, Shape][] = [['home', 'depth'], ['work', 'quant'], ['index', 'sphere'], ['journey', 'sphere'], ['activity', 'sphere'], ['about', 'sphere'], ['contact', 'burst']];
    const update = () => {
      const mid = innerHeight * 0.45; let shape: Shape = 'depth', at = 'home';
      ids.forEach(([id, sh]) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < mid) { shape = sh; at = id; } });
      scene.dim = at === 'journey' || at === 'activity' ? 0.4 : 1;
      if (scene.workIdx >= 0) shape = FEATURED[scene.workIdx].shape;
      scene.shape = shape;
    };
    update();
    document.addEventListener('scroll', update, { passive: true, capture: true });
    const id = setInterval(update, 300);
    return () => { document.removeEventListener('scroll', update, { capture: true }); clearInterval(id); };
  }, []);
  return null;
}

// Case-study pages: hold the project's shape, dimmed so the text leads.
export function CaseDirector({ shape }: { shape: Shape }) {
  useEffect(() => {
    scene.shape = shape; scene.dim = 0.5; scene.conv = 1; scene.marksT = 1; scene.race = null;
    return () => { scene.dim = 1; };
  }, [shape]);
  return null;
}
