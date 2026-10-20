'use client';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

type N = { id: string; x: number; y: number; w: number; t: string; s: string; dash?: boolean };
type E = { id: string; d: string; dash?: boolean };
type D = { title: string; vb: string; nodes: N[]; edges: E[]; notes?: { x: number; y: number; t: string }[]; modes?: { key: string; label: string; edges: string[]; nodes: string[]; note: string }[]; hot?: string[]; flow?: string[] };

const H = 60;
const DIAGRAMS: Record<string, D> = {
  quant: {
    title: 'One binary, three worlds',
    vb: '0 0 1000 300',
    nodes: [
      { id: 'hs', x: 20, y: 40, w: 190, t: 'HistoricalSource', s: 'Parquet replay' },
      { id: 'ls', x: 20, y: 230, w: 190, t: 'LiveSource', s: 'Binance WebSocket' },
      { id: 'st', x: 300, y: 4, w: 170, t: 'Strategy', s: "can't tell which world" },
      { id: 'en', x: 300, y: 135, w: 170, t: 'Engine', s: 'recv-time dispatch' },
      { id: 'rk', x: 560, y: 135, w: 180, t: 'RiskLayer', s: 'every order, no bypass' },
      { id: 'sv', x: 810, y: 40, w: 180, t: 'SimulatedVenue', s: 'fills · fees · latency' },
      { id: 'lv', x: 810, y: 230, w: 180, t: 'LiveVenue', s: 'real orders · M8', dash: true },
    ],
    edges: [
      { id: 'hs-en', d: 'M210 70 C255 70 255 165 300 165' },
      { id: 'ls-en', d: 'M210 260 C255 260 255 165 300 165' },
      { id: 'st-en', d: 'M385 64 L385 135' },
      { id: 'en-rk', d: 'M470 165 L560 165' },
      { id: 'rk-sv', d: 'M740 165 C775 165 775 70 810 70' },
      { id: 'rk-lv', d: 'M740 165 C775 165 775 260 810 260', dash: true },
    ],
    modes: [
      { key: 'backtest', label: 'Backtest', edges: ['hs-en', 'en-rk', 'rk-sv'], nodes: ['hs', 'en', 'rk', 'sv'], note: 'Historical data into the simulated venue.' },
      { key: 'paper', label: 'Paper', edges: ['ls-en', 'en-rk', 'rk-sv'], nodes: ['ls', 'en', 'rk', 'sv'], note: 'Live data into the same simulated venue. No separate paper fill model.' },
      { key: 'live', label: 'Live', edges: ['ls-en', 'en-rk', 'rk-lv'], nodes: ['ls', 'en', 'rk', 'lv'], note: 'Live data, real orders. In progress (M8).' },
    ],
  },
  redpen: {
    title: 'How a paper gets marked',
    vb: '0 0 1000 300',
    nodes: [
      { id: 'up', x: 10, y: 50, w: 150, t: 'Upload', s: 'answer PDF' },
      { id: 'ex', x: 175, y: 50, w: 150, t: 'Extract', s: 'text + boxes' },
      { id: 'gr', x: 340, y: 50, w: 150, t: 'Grade', s: 'LLM · JSON schema' },
      { id: 'rc', x: 505, y: 50, w: 150, t: 'Reconcile', s: 'clamp · recompute' },
      { id: 'an', x: 670, y: 50, w: 150, t: 'Anchor', s: 'quote → page box' },
      { id: 'ao', x: 835, y: 50, w: 155, t: 'Annotate', s: 'on a copy' },
      { id: 'og', x: 10, y: 200, w: 150, t: 'Original', s: 'stored, read-only' },
      { id: 'of', x: 340, y: 200, w: 150, t: 'Offline grader', s: 'labelled degraded', dash: true },
    ],
    edges: [
      { id: 'a', d: 'M160 80 L175 80' }, { id: 'b', d: 'M325 80 L340 80' }, { id: 'c', d: 'M490 80 L505 80' },
      { id: 'd', d: 'M655 80 L670 80' }, { id: 'e', d: 'M820 80 L835 80' },
      { id: 'f', d: 'M85 110 L85 200' },
      { id: 'g', d: 'M415 110 L415 200', dash: true },
      { id: 'h', d: 'M490 230 C540 230 560 140 580 110', dash: true },
    ],
    notes: [{ x: 425, y: 165, t: 'model down or malformed output' }],
    flow: ['a', 'b', 'c', 'd', 'e'], hot: ['rc'],
  },
  'order-book': {
    title: 'The cancel path, 38.3 ns at the median',
    vb: '0 0 1000 230',
    nodes: [
      { id: 'id', x: 10, y: 60, w: 160, t: 'cancel(id)', s: 'order id in' },
      { id: 'ht', x: 210, y: 60, w: 180, t: 'OrderTable', s: 'one probe → tick, qty' },
      { id: 'pa', x: 430, y: 60, w: 180, t: 'Price array', s: 'qty_[tick] -= qty' },
      { id: 'bm', x: 650, y: 60, w: 160, t: 'Bitmap', s: 'clz/ctz, 64 levels', dash: true },
      { id: 'bb', x: 850, y: 60, w: 140, t: 'Best price', s: 'cached index' },
    ],
    edges: [
      { id: 'a', d: 'M170 90 L210 90' }, { id: 'b', d: 'M390 90 L430 90' },
      { id: 'c', d: 'M610 90 L650 90', dash: true }, { id: 'd', d: 'M810 90 L850 90' },
      { id: 'e', d: 'M520 120 C520 185 920 185 920 120' },
    ],
    notes: [{ x: 650, y: 46, t: 'only when the best level empties' }, { x: 210, y: 142, t: 'open addressing · Fibonacci hash' }, { x: 600, y: 212, t: 'level still has orders: done' }],
    flow: ['a', 'b', 'e'], hot: ['ht', 'pa'],
  },
  sift: {
    title: 'Ingest, then search',
    vb: '0 0 1000 310',
    nodes: [
      { id: 'up', x: 10, y: 30, w: 140, t: 'Upload', s: 'PDF · image · DOCX' },
      { id: 'st', x: 175, y: 30, w: 170, t: 'S3 + Postgres', s: 'file + pending row' },
      { id: 'q', x: 370, y: 30, w: 120, t: 'Redis', s: 'job queue' },
      { id: 'wk', x: 515, y: 30, w: 230, t: 'Celery worker', s: 'extract · OCR · thumb · embed' },
      { id: 'db', x: 770, y: 30, w: 220, t: 'Postgres', s: 'full-text + pgvector' },
      { id: 'qs', x: 10, y: 205, w: 140, t: 'Query', s: '"notice period"' },
      { id: 'kw', x: 200, y: 165, w: 180, t: 'Keyword rank', s: 'Postgres FTS' },
      { id: 'se', x: 200, y: 245, w: 180, t: 'Semantic rank', s: 'pgvector' },
      { id: 'rr', x: 430, y: 205, w: 200, t: 'RRF', s: 'Σ 1 / (60 + rank)' },
      { id: 'rs', x: 680, y: 205, w: 160, t: 'Results', s: 'live via WebSocket' },
    ],
    edges: [
      { id: 'a', d: 'M150 60 L175 60' }, { id: 'b', d: 'M345 60 L370 60' }, { id: 'c', d: 'M490 60 L515 60' }, { id: 'd', d: 'M745 60 L770 60' },
      { id: 'e', d: 'M150 235 C175 235 175 195 200 195' }, { id: 'f', d: 'M150 235 C175 235 175 275 200 275' },
      { id: 'g', d: 'M380 195 C405 195 405 235 430 235' }, { id: 'h', d: 'M380 275 C405 275 405 235 430 235' }, { id: 'i', d: 'M630 235 L680 235' },
      { id: 'j', d: 'M880 90 C880 140 290 130 290 165', dash: true },
    ],
    notes: [{ x: 560, y: 108, t: 'both rankings read the same Postgres' }],
    flow: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], hot: ['rr'],
  },
};

const SPRING = { type: 'spring', stiffness: 420, damping: 36 } as const;

export default function Diagram({ kind }: { kind: string }) {
  const d = DIAGRAMS[kind];
  const [mode, setMode] = useState(d?.modes?.[0].key ?? '');
  const [motionOk, setMotionOk] = useState(false);
  useEffect(() => { setMotionOk(!matchMedia('(prefers-reduced-motion: reduce)').matches); }, []);
  if (!d) return null;
  const m = d.modes?.find((x) => x.key === mode);
  const onEdges = new Set(m ? m.edges : d.flow ?? []);
  const hotNodes = new Set(m ? m.nodes : d.hot ?? []);
  const byId = Object.fromEntries(d.edges.map((e) => [e.id, e]));

  return (
    <section className="diagram">
      <div className="card">
        <div className="dhead">
          <h2>{d.title}</h2>
          {d.modes && (
            <div className="seg" role="group" aria-label="Mode">
              {d.modes.map((x) => (
                <button key={x.key} type="button" aria-pressed={mode === x.key} onClick={() => setMode(x.key)}>
                  {mode === x.key && <motion.span layoutId={`dg-${kind}`} className="ind" transition={SPRING} />}
                  <span>{x.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {m && <p className="lbl" style={{ margin: '0 0 8px' }}>{m.note}</p>}
        <div className="dscroll">
          <svg viewBox={d.vb} role="img" aria-label={`${d.title}: ${d.nodes.map((n) => n.t).join(', ')}`}>
            {d.edges.map((e) => <path key={e.id} d={e.d} className={'de' + (onEdges.has(e.id) ? ' on' : '') + (e.dash ? ' dash' : '')} />)}
            {d.nodes.map((n) => (
              <g key={n.id} className={'dn' + (hotNodes.has(n.id) ? ' hot' : '') + (n.dash ? ' dash' : '')}>
                <rect x={n.x} y={n.y} width={n.w} height={H} rx={12} />
                <text className="t" x={n.x + 16} y={n.y + 26}>{n.t}</text>
                <text className="s" x={n.x + 16} y={n.y + 46}>{n.s}</text>
              </g>
            ))}
            {d.notes?.map((t) => <text key={t.t} className="dnote" x={t.x} y={t.y}>{t.t}</text>)}
            {motionOk && [...onEdges].map((id, i) => byId[id] && (
              <circle key={mode + id} r={4} className="dp">
                <animateMotion dur={`${1.4 + (i % 3) * 0.2}s`} begin={`${i * 0.18}s`} repeatCount="indefinite" path={byId[id].d} />
              </circle>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}
