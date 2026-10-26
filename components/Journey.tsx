/* eslint-disable @next/next/no-img-element */
'use client';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useScrambleInView } from './useScramble';

type Step = { dt: string; title: string; p: string; img?: string; adds: string[]; big?: boolean };

// Dates are when the work happened (repo creation or first commit), not when it was published.
// `adds` is what that project introduced to the stack.
const STEPS: Step[] = [
  { dt: 'Nov 2024', title: 'First websites', p: 'Plain HTML, CSS and JavaScript, starting with cyclemate and a collaborative whiteboard.', adds: ['HTML', 'CSS', 'JavaScript'] },
  { dt: 'Feb 2025', title: 'cook.io', p: 'A recipe site with search, filters and saved recipes.', img: 'cookio', adds: ['APIs'] },
  { dt: 'Apr 2025', title: 'WorldAtlas', p: 'Facts and detail pages for every country.', img: 'worldatlas', adds: ['Routing'] },
  { dt: 'May 2025', title: 'TidyMind', p: 'An Electron file manager with semantic search and duplicate detection.', img: 'tidy', adds: ['TypeScript', 'Electron', 'Embeddings'] },
  { dt: 'Sep 2025', title: 'A month of breadth', p: 'A chess game in Pygame, a Kanban job tracker and a full-stack P2P app.', img: 'chess', adds: ['Python', 'Node.js'] },
  { dt: 'Oct 2025', title: 'MERN month', p: 'An e-commerce store, a hotel booking system and a job portal, end to end.', adds: ['React', 'Express', 'MongoDB'] },
  { dt: 'Dec 2025', title: 'Backends in Java', p: 'A Spring Boot ride-sharing API with JWT auth and role-based access.', adds: ['Java', 'Spring Boot', 'JWT'] },
  { dt: 'Feb 2026', title: 'Mind Palace', p: 'Notes as a 3D graph of linked ideas, tagged and connected by Gemini.', img: 'mind', adds: ['Three.js', 'Supabase'] },
  { dt: 'Mar 2026', title: 'Systems design, for real', p: 'nexo scales chat out over Redis pub/sub. Low-level design in Java.', img: 'nexo', adds: ['Redis', 'Socket.io', 'PostgreSQL'] },
  { dt: 'May 2026', title: 'RAG and agents', p: 'A NotebookLM clone that answers from your PDFs, and an agent that builds websites.', img: 'notebook', adds: ['RAG', 'LLM APIs'] },
  { dt: 'Jun 2026', title: 'momentum, typeahead, a browser agent', p: 'A PWA for accountability groups, consistent hashing across Redis nodes, a vision-LLM agent.', img: 'momentum', adds: ['Next.js', 'Playwright'] },
  { dt: 'Jul 2026', title: 'sift ships, quant begins', p: 'Hybrid document search goes live. On 26 July, the first commit of a Rust trading platform.', img: 'sift', adds: ['FastAPI', 'pgvector', 'Rust'], big: true },
  { dt: 'Aug 2026', title: 'quant runs a week alone', p: 'The market-data recorder runs 7 days unattended, every gap explained by a record in the capture.', adds: ['Tokio', 'Parquet'] },
  { dt: 'Sep 2026', title: 'RedPen in 36 hours', p: "AI marking that never trusts the model's arithmetic. 102 tests against 23 planted errors.", img: 'redpen', adds: ['LLM evals'] },
  { dt: 'Oct 2026', title: 'Paper matches backtest', p: 'A 14-day live paper run reproduces its backtest to the satoshi. Plus a 38.3 ns order book and real EKS runs.', adds: ['C++', 'Kubernetes', 'Terraform', 'AWS'], big: true },
];

const ERAS = [
  { from: 0, name: 'Web foundations', acc: 'var(--cyan)' },
  { from: 5, name: 'Full-stack', acc: 'var(--violet)' },
  { from: 9, name: 'AI products', acc: 'var(--coral)' },
  { from: 12, name: 'Systems', acc: 'var(--teal)' },
];
const SLOT = 170; // width of one timeline slot, matches .jr-slot
const eraOf = (i: number) => [...ERAS].reverse().find((e) => i >= e.from)!;

export default function Journey() {
  const sec = useRef<HTMLElement>(null), track = useRef<HTMLDivElement>(null), h2 = useRef<HTMLHeadingElement>(null);
  useScrambleInView(h2);
  const [dist, setDist] = useState(0);
  const [pinned, setPinned] = useState(true);
  const [active, setActive] = useState(0);

  // The active card always sits at the same focus point; the track slides under it.
  useEffect(() => {
    const measure = () => {
      const pin = innerWidth >= 900; setPinned(pin);
      if (!track.current || !sec.current) return;
      const vis = track.current.parentElement?.clientWidth ?? innerWidth, focus = Math.round(vis * 0.32);
      track.current.style.paddingLeft = pin ? `${focus - SLOT / 2}px` : '';
      track.current.style.paddingRight = pin ? `${vis - focus}px` : '';
      const d = SLOT * (STEPS.length - 1);
      setDist(d);
      sec.current.style.height = pin ? `${d * 1.5 + innerHeight}px` : '';
    };
    measure(); addEventListener('resize', measure);
    return () => removeEventListener('resize', measure);
  }, []);

  const { scrollYProgress } = useScroll({ target: sec, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1]);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!pinned) return;
    const i = Math.max(0, Math.min(STEPS.length - 1, Math.round(v * (STEPS.length - 1))));
    setActive((a) => (a === i ? a : i));
  });

  const era = eraOf(active);
  // newest first, so what was just learned never gets clipped
  const stack = STEPS.slice(0, active + 1).flatMap((s, si) => s.adds.map((t) => ({ t, fresh: si === active }))).reverse();

  return (
    <section className="jr" id="journey" ref={sec} style={{ ['--era' as string]: era.acc }}>
      <div className="jr-stage">
        <div className="jr-head">
          <h2 ref={h2}>Two years of building</h2>
          <span className="lbl">From first websites to a trading engine · scroll</span>
        </div>

        <div className="jr-body">
          <aside className="jr-side" aria-hidden={!pinned}>
            <div className="jr-date">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={STEPS[active].dt} initial={{ y: '60%', opacity: 0, filter: 'blur(8px)' }} animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: '-60%', opacity: 0, filter: 'blur(8px)' }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}>
                  {STEPS[active].dt}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="jr-era">
              <i />
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={era.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.25 }}>{era.name}</motion.span>
              </AnimatePresence>
              <b>{String(active + 1).padStart(2, '0')} / {STEPS.length}</b>
            </div>
            <div className="jr-stack">
              <span className="lbl">Stack so far</span>
              <div className="chips">
                <AnimatePresence initial={false}>
                  {stack.map(({ t, fresh }) => (
                    <motion.span layout key={t} className={'chip' + (fresh ? ' fresh' : '')} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }} transition={{ type: 'spring', stiffness: 420, damping: 30 }}>{t}</motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </aside>

          <div className="jr-view">
            <motion.div className="jr-track" ref={track} style={pinned ? { x } : undefined}>
              <div className="jr-rail"><motion.i style={pinned ? { scaleX: fill } : undefined} /></div>
              {STEPS.map((s, i) => {
                const on = !pinned || i === active, past = i <= active, acc = eraOf(i).acc;
                return (
                  <div key={s.dt + s.title} className={'jr-slot ' + (i % 2 ? 'down' : 'up')} style={{ ['--acc' as string]: acc }}>
                    <span className={'jr-dot' + (past ? ' past' : '') + (i === active && pinned ? ' cur' : '')} />
                    <motion.article className={'jr-card' + (s.big ? ' big' : '') + (on ? ' on' : '')}
                      animate={pinned ? { opacity: on ? 1 : past ? 0.55 : 0.4, scale: on ? 1 : 0.96 } : { opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 28 }}>
                      {s.img && <div className="im"><img src={`/timeline/${s.img}.jpg`} alt={`${s.title} screenshot`} loading="lazy" /></div>}
                      <div className="tx">
                        <span className="dt">{s.dt}</span>
                        <h3>{s.title}</h3>
                        <p>{s.p}</p>
                        <span className="tg">+ {s.adds.join(' · ')}</span>
                      </div>
                    </motion.article>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
