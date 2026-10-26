'use client';
import Link from 'next/link';
import { AnimatePresence, animate, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { FEATURED } from '@/lib/data';
import { OB, scene, type Bench, type Op, type SiftMode } from '@/lib/scene';
import { scrollToY } from '@/lib/lenis';
import { scramble } from './useScramble';
import { captureTitle } from '@/lib/morph';

const SPRING = { type: 'spring', stiffness: 420, damping: 36 } as const;

function Seg<T extends string>({ id, options, value, onChange }: { id: string; options: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="seg" role="group">
      {options.map(([v, label]) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>
          {value === v && <motion.span layoutId={`seg-${id}`} className="ind" transition={SPRING} />}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

const Arrow = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M5 11L11 5M6 5h5v5" /></svg>;

export default function WorkStage() {
  const sec = useRef<HTMLElement>(null), prog = useRef<HTMLElement>(null), title = useRef<HTMLHeadingElement>(null);
  const [idx, setIdx] = useState(0);
  const [op, setOp] = useState<Op>(scene.op);
  const [marked, setMarked] = useState(scene.marksT === 1);
  const [sift, setSift] = useState<SiftMode>(scene.sift);
  const [raceText, setRaceText] = useState<string | null>(null);
  const [bench, setBench] = useState<'idle' | 'running' | 'done' | 'failed'>(scene.measured ? 'done' : 'idle');
  const [benchMsg, setBenchMsg] = useState<string | null>(null);
  const worker = useRef<Worker | null>(null);
  const p = FEATURED[idx];

  useEffect(() => {
    const onScroll = () => {
      const el = sec.current; if (!el) return;
      const r = el.getBoundingClientRect(), span = el.offsetHeight - innerHeight, wp = -r.top / span, mid = innerHeight * 0.45;
      const i = Math.max(0, Math.min(3, Math.floor(Math.max(0, Math.min(0.999, wp)) * 4)));
      setIdx(i);
      if (prog.current) prog.current.style.transform = `scaleX(${Math.max(0, Math.min(1, wp * 4 - i))})`;
      scene.workIdx = r.top < mid && r.bottom > mid ? i : -1;
    };
    onScroll();
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    addEventListener('resize', onScroll);
    return () => { document.removeEventListener('scroll', onScroll, { capture: true }); removeEventListener('resize', onScroll); scene.workIdx = -1; };
  }, []);

  // keep the active tab visible when the tab strip scrolls (phones)
  useEffect(() => {
    const strip = sec.current?.querySelector<HTMLElement>('.tabs'), btn = strip?.querySelectorAll<HTMLElement>('[role=tab]')[idx];
    if (strip && btn && strip.scrollWidth > strip.clientWidth) strip.scrollTo({ left: btn.offsetLeft - strip.clientWidth / 2 + btn.offsetWidth / 2, behavior: 'smooth' });
  }, [idx]);

  useEffect(() => {
    // the new title mounts after the old one finishes exiting
    const t = setTimeout(() => scramble(title.current), 200);
    if (p.slug === 'quant' && !matchMedia('(prefers-reduced-motion: reduce)').matches) replay();
    return () => clearTimeout(t);
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { scene.onRace = setRaceText; return () => { scene.onRace = null; worker.current?.terminate(); }; }, []);

  // Runs the real C++ books, compiled to WebAssembly, in a worker. Nothing is downloaded until this is pressed.
  function measure() {
    if (bench === 'running') return;
    setBench('running'); setBenchMsg('loading the C++ build…'); scene.race = null; setRaceText(null);
    const w = new Worker('/wasm/lob-worker.js'); worker.current = w;
    const names: Record<string, string> = { map: 'std::map', heap: 'heap', ours: 'ours' };
    const stop = (msg: string | null) => { w.terminate(); worker.current = null; setBenchMsg(msg); };
    w.onmessage = (e: MessageEvent) => {
      const d = e.data;
      if (d.type === 'progress') setBenchMsg(`measuring on your CPU · ${names[d.impl]} · run ${d.run} / ${d.runs}`);
      else if (d.type === 'done') {
        const r = d.results;
        scene.measured = { cancel: { map: r.map.cancel, heap: r.heap.cancel, ours: r.ours.cancel }, add: { map: r.map.add, heap: r.heap.add, ours: r.ours.add } } satisfies Bench;
        setBench('done'); stop(null); scene.race = { t0: performance.now() };
      } else { setBench('failed'); stop(`couldn't run here (${d.message}) · showing the recorded numbers`); }
    };
    w.onerror = () => { setBench('failed'); stop("couldn't run here · showing the recorded numbers"); };
    w.postMessage({ n: 100000, runs: 5 });
  }

  function replay() {
    scene.conv = 0;
    animate(0, 1, { duration: 2.4, ease: [0.65, 0, 0.35, 1], delay: 0.35, onUpdate: (v) => { scene.conv = v; } });
  }
  function jump(i: number) {
    const el = sec.current; if (!el) return;
    const span = el.offsetHeight - innerHeight;
    scrollToY(el.offsetTop + span * (i + 0.5) / 4);
  }

  const o = (scene.measured ?? OB)[op];
  const readout =
    p.slug === 'quant' ? 'BTCUSDT fills 824 = 824 · ETHUSDT 822 = 822'
      : p.slug === 'redpen' ? (marked ? 'R3 answer + unit: 1 / 2 · total = Σ rows = 5 / 6' : 'clean copy · the original is never modified')
        : p.slug === 'order-book' ? (raceText ?? benchMsg ?? (bench === 'done'
          ? `${op}_order · map ${o.map} · heap ${o.heap} · ours ${o.ours} ns · measured in your browser`
          : `${op}_order · map ${o.map} · heap ${o.heap} · ours ${o.ours} ns · recorded natively`))
          : { kw: 'Postgres full-text ranking only', se: 'pgvector semantic ranking only', fused: 'fused: terms.docx wins, ranked well in both' }[sift];

  return (
    <section className="work" id="work" ref={sec} style={{ ['--acc' as string]: p.acc }}>
      <div className="stage">
        <div className="w">
          <div className="tabs" role="tablist" aria-label="Featured projects">
            {FEATURED.map((f, i) => (
              <button key={f.slug} role="tab" aria-selected={i === idx} onClick={() => jump(i)}>
                {i === idx && <motion.span layoutId="tab-ind" className="ind" transition={SPRING} />}
                <span className="n">{f.n}</span><span>{f.title}</span>
              </button>
            ))}
          </div>
          <div className="prog"><i ref={prog} /></div>
          <div className="split">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={p.slug} className="detail" role="tabpanel"
                initial="out" animate="in" exit="gone" variants={{ in: { transition: { staggerChildren: 0.045 } } }}>
                {[
                  <div className="h" key="h"><h2 ref={title}>{p.title}</h2><span className="tag">{p.tag}</span></div>,
                  <p className="th" key="th">{p.th}</p>,
                  <p className="bd" key="bd">{p.bd}</p>,
                  <div className="stats" key="st">{p.stats.map(([v, l]) => <div key={l}><div className="v">{v}</div><div className="l">{l}</div></div>)}</div>,
                  <div className="links" key="ln">
                    <Link className="b p" href={`/work/${p.slug}`} onClick={() => captureTitle(title.current)}>Read the case study <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg></Link>
                    {p.links.map(([label, href]) => <a key={href} className="b" href={href} target="_blank" rel="noopener noreferrer">{label} <Arrow /></a>)}
                  </div>,
                ].map((child, k) => (
                  <motion.div key={k} variants={{ out: { opacity: 0, y: 18, filter: 'blur(6px)' }, in: { opacity: 1, y: 0, filter: 'blur(0px)' }, gone: { opacity: 0, y: -12, filter: 'blur(4px)', transition: { duration: 0.15 } } }}
                    transition={{ type: 'spring', stiffness: 260, damping: 30 }}>{child}</motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
            <div className="viz">
              <div className="readout" aria-live="polite">{readout}</div>
              <motion.div className="ctl" key={p.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}>
                {p.slug === 'quant' && (
                  <button type="button" className="b" onClick={replay}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 8a5 5 0 1 0 1.5-3.6M3 3v2.5h2.5" /></svg>Replay convergence
                  </button>
                )}
                {p.slug === 'redpen' && <Seg id="rp" options={[['1', 'Marked'], ['0', 'Clean copy']]} value={marked ? '1' : '0'} onChange={(v) => { setMarked(v === '1'); scene.marksT = +v; }} />}
                {p.slug === 'order-book' && (
                  <>
                    <Seg id="ob" options={[['cancel', 'cancel_order'], ['add', 'add_order']]} value={op} onChange={(v) => { setOp(v); scene.op = v; scene.race = null; setRaceText(null); }} />
                    {/* first press measures on the visitor's CPU and races those numbers; after that it replays */}
                    <button type="button" className="b p" disabled={bench === 'running'} aria-busy={bench === 'running'}
                      onClick={() => { if (bench === 'idle') measure(); else { setBenchMsg(null); scene.race = { t0: performance.now() }; } }}>
                      {bench === 'idle' || bench === 'running'
                        ? <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="8" height="8" rx="1.5" /><path d="M6.5 1.5v2.5M9.5 1.5v2.5M6.5 12v2.5M9.5 12v2.5M1.5 6.5H4M1.5 9.5H4M12 6.5h2.5M12 9.5h2.5" strokeLinecap="round" /></svg>
                        : <svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 3l9 5-9 5z" /></svg>}
                      {bench === 'idle' ? 'Run on my CPU' : bench === 'running' ? 'Measuring…' : 'Run race'}
                    </button>
                  </>
                )}
                {p.slug === 'sift' && <Seg id="sf" options={[['kw', 'Keyword'], ['se', 'Semantic'], ['fused', 'Fused']]} value={sift} onChange={(v) => { setSift(v); scene.sift = v; }} />}
              </motion.div>
              <div className="figcap">{p.cap}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
