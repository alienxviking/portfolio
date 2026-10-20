'use client';
import { useInView } from 'motion/react';
import { useMemo, useRef, useState } from 'react';
import type { Day } from '@/lib/github';
import { useScrambleInView } from './useScramble';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmt = (iso: string) => { const d = new Date(iso + 'T00:00:00Z'); return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };

export default function Heatmap({ days, total, live }: { days: Day[]; total: number; live: boolean }) {
  const wrap = useRef<HTMLDivElement>(null), h2 = useRef<HTMLHeadingElement>(null);
  const inView = useInView(wrap, { once: true, amount: 0.3 });
  useScrambleInView(h2);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);

  const { cells, weeks, months, stats } = useMemo(() => {
    const pad = days.length ? new Date(days[0].date + 'T00:00:00Z').getUTCDay() : 0; // first column starts on Sunday
    const cells: (Day | null)[] = [...Array(pad).fill(null), ...days];
    const weeks = Math.ceil(cells.length / 7);
    const months: { col: number; label: string }[] = [];
    let last = -1;
    for (let w = 0; w < weeks; w++) {
      const d = cells[w * 7] ?? cells[w * 7 + 6]; if (!d) continue;
      const m = new Date(d.date + 'T00:00:00Z').getUTCMonth();
      if (m !== last) { months.push({ col: w, label: MONTHS[m] }); last = m; }
    }
    let longest = 0, run = 0, active = 0, best = days[0];
    days.forEach((d) => { if (d.count > 0) { run++; active++; longest = Math.max(longest, run); } else run = 0; if (best && d.count > best.count) best = d; });
    let current = 0; for (let i = days.length - 1; i >= 0; i--) { if (days[i].count > 0) current++; else if (i < days.length - 1) break; }
    return { cells, weeks, months, stats: { longest, current, active, best } };
  }, [days]);

  return (
    <section className="act" id="activity">
      <div className="w">
        <div className="sh">
          <h2 ref={h2}>Activity</h2>
          <span className="lbl">{total.toLocaleString('en-US')} contributions in the last year · {live ? 'live from GitHub' : 'from GitHub'}</span>
        </div>
        <div className="hm-wrap" ref={wrap} onPointerLeave={() => setTip(null)}>
          <div className={'hm' + (inView ? ' on' : '')}>
            <div className="hm-months" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}>
              {months.map((m) => <span key={m.col} style={{ gridColumn: `${m.col + 1} / span 3` }}>{m.label}</span>)}
            </div>
            <div className="hm-grid" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }} role="img"
              aria-label={`${total} GitHub contributions in the last year, ${stats.active} active days, longest streak ${stats.longest} days`}>
              {cells.map((d, i) => d
                ? <span key={d.date} data-l={d.level} style={{ ['--c' as string]: Math.floor(i / 7) }}
                    onPointerEnter={(e) => {
                      const r = (e.target as HTMLElement).getBoundingClientRect(), wr = wrap.current!.getBoundingClientRect();
                      setTip({ x: r.left - wr.left + r.width / 2 + wrap.current!.scrollLeft, y: r.top - wr.top - 6, text: `${d.count === 0 ? 'No' : d.count} contribution${d.count === 1 ? '' : 's'} · ${fmt(d.date)}` });
                    }} />
                : <span key={'pad' + i} style={{ visibility: 'hidden' }} />)}
            </div>
          </div>
          {tip && <div className="hm-tip" style={{ left: tip.x, top: tip.y }}>{tip.text}</div>}
        </div>
        <div className="hm-stats">
          <div><div className="v">{stats.active}</div><div className="l">active days out of {days.length}</div></div>
          <div><div className="v">{stats.longest} {stats.longest === 1 ? 'day' : 'days'}</div><div className="l">longest streak</div></div>
          <div><div className="v">{stats.current} {stats.current === 1 ? 'day' : 'days'}</div><div className="l">current streak</div></div>
          <div><div className="v">{stats.best?.count ?? 0}</div><div className="l">on the busiest day, {stats.best ? fmt(stats.best.date) : ''}</div></div>
        </div>
      </div>
    </section>
  );
}
