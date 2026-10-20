/* eslint-disable @next/next/no-img-element */
'use client';
import { motion, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useScrambleInView } from './useScramble';

type Step = { dt: string; title: string; p: string; tg: string; img?: string; now?: boolean };

// Dates are when the work happened (repo creation or first commit), not when it was published.
const STEPS: Step[] = [
  { dt: 'Nov 2024', title: 'First websites', p: 'Plain HTML, CSS and JavaScript, starting with cyclemate and a collaborative whiteboard.', tg: 'HTML · CSS · JS' },
  { dt: 'Feb 2025', title: 'cook.io', p: 'A recipe site with search, filters and saved recipes.', tg: 'JavaScript', img: 'cookio' },
  { dt: 'Apr 2025', title: 'WorldAtlas', p: 'Facts and detail pages for every country.', tg: 'JavaScript', img: 'worldatlas' },
  { dt: 'May 2025', title: 'TidyMind', p: 'An Electron file manager with semantic search and duplicate detection.', tg: 'Electron · embeddings', img: 'tidy' },
  { dt: 'Sep 2025', title: 'Chess, a job tracker, a P2P platform', p: 'A month of breadth: a chess game in Pygame, a Kanban job tracker and a full-stack P2P app.', tg: 'Python · TypeScript · Node', img: 'chess' },
  { dt: 'Oct 2025', title: 'MERN month', p: 'An e-commerce store, a hotel booking system and a job portal, end to end.', tg: 'MongoDB · Express · React · Node' },
  { dt: 'Dec 2025', title: 'Backends in Java', p: 'A Spring Boot ride-sharing API with JWT auth and role-based access.', tg: 'Spring Boot · MongoDB' },
  { dt: 'Feb 2026', title: 'Mind Palace', p: 'Notes as a 3D graph of linked ideas, tagged and connected by Gemini.', tg: 'Three.js · Supabase', img: 'mind' },
  { dt: 'Mar 2026', title: 'Systems design, for real', p: 'nexo scales chat out with Redis pub/sub. Low-level design in Java: rate limiter, distributed cache, parking lot.', tg: 'Socket.io · Redis · Java', img: 'nexo' },
  { dt: 'May 2026', title: 'RAG and agents', p: 'A NotebookLM clone that answers from your PDFs, and an agent that clones websites.', tg: 'Gemini · RAG', img: 'notebook' },
  { dt: 'Jun 2026', title: 'momentum, typeahead, a browser agent', p: 'Accountability groups as a PWA, consistent hashing across Redis nodes, and a vision-LLM agent.', tg: 'Next.js · Redis · Playwright', img: 'momentum' },
  { dt: 'Jul 2026', title: 'sift, then quant begins', p: 'Hybrid document search ships. On 26 July, the first commit of a Rust trading platform.', tg: 'pgvector · Rust', img: 'sift' },
  { dt: 'Aug 2026', title: 'quant runs a week alone', p: 'The market-data recorder runs 7 days unattended, every gap explained by a record in the capture.', tg: 'Rust · Tokio' },
  { dt: 'Sep 2026', title: 'RedPen in 36 hours', p: 'An AI marking tool that never trusts the model\'s arithmetic. 102 tests against 23 planted errors.', tg: 'TypeScript · LLMs', img: 'redpen' },
  { dt: 'Oct 2026', title: 'Paper matches backtest', p: 'A 14-day live paper run reproduces its backtest to the satoshi. Plus a 38.3 ns order book and real EKS runs.', tg: 'Now · M8: going live', now: true },
];

export default function Journey() {
  const sec = useRef<HTMLElement>(null), track = useRef<HTMLDivElement>(null), h2 = useRef<HTMLHeadingElement>(null);
  useScrambleInView(h2);
  const [dist, setDist] = useState(0);
  const [pinned, setPinned] = useState(true);
  useEffect(() => {
    const measure = () => {
      const pin = innerWidth >= 900; setPinned(pin);
      if (!track.current || !sec.current) return;
      const d = Math.max(0, track.current.scrollWidth - innerWidth + 32);
      setDist(d);
      sec.current.style.height = pin ? `${d + innerHeight}px` : '';
    };
    measure(); addEventListener('resize', measure);
    return () => removeEventListener('resize', measure);
  }, []);
  const { scrollYProgress } = useScroll({ target: sec, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="jr" id="journey" ref={sec}>
      <div className="jr-stage">
        <div className="jr-head">
          <h2 ref={h2}>Two years of building</h2>
          <span className="lbl">From first websites to a trading engine · scroll</span>
        </div>
        <div className="jr-rail"><motion.i style={{ scaleX: fill }} /></div>
        <motion.div className="jr-track" ref={track} style={pinned ? { x } : undefined}>
          {STEPS.map((s, i) => (
            <motion.article key={s.dt + s.title} className={'jr-card' + (s.img ? '' : ' noimg') + (s.now ? ' now' : '')}
              initial={{ opacity: 0.4, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}
              transition={{ type: 'spring', stiffness: 160, damping: 22, delay: (i % 4) * 0.04 }}>
              {s.img && <div className="im"><img src={`/timeline/${s.img}.jpg`} alt={`${s.title} screenshot`} loading="lazy" /></div>}
              <div className="tx">
                <span className="dt">{s.dt}</span>
                <h3>{s.title}</h3>
                <p>{s.p}</p>
                <span className="tg">{s.tg}</span>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
