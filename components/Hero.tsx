'use client';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SITE, WORDS } from '@/lib/data';
import { startGrains } from '@/lib/grains';
import { startMarket, type MarketStatus } from '@/lib/market';
import { scene } from '@/lib/scene';
import CopyEmail from './CopyEmail';
import { MagneticLink } from './Magnetic';
import BookReadout from './BookReadout';

const EASE = [0.22, 1, 0.36, 1] as const;
const NAME = ['Snehangshu', 'Roy'];
const INTRO_KEY = 'sr-intro-seen';

function RotatingWord() {
  const [i, setI] = useState(0);
  const [w, setW] = useState<number | 'auto'>('auto');
  const measure = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % WORDS.length), 2600);
    return () => clearInterval(id);
  }, []);
  useLayoutEffect(() => { if (measure.current) setW(measure.current.offsetWidth); }, [i]);
  return (
    <motion.span className="rot" animate={{ width: w }} transition={{ type: 'spring', stiffness: 260, damping: 30 }}>
      <span ref={measure} aria-hidden="true" style={{ visibility: 'hidden', position: 'absolute' }}>{WORDS[i]}</span>
      <AnimatePresence initial={false}>
        <motion.span key={WORDS[i]} initial={{ y: '100%', opacity: 0, filter: 'blur(6px)' }} animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-100%', opacity: 0, filter: 'blur(6px)' }} transition={{ duration: 0.55, ease: EASE }}>{WORDS[i]}</motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

// Letters near the cursor get heavier, like a wave moving through the type.
function useWeightWave(h1: React.RefObject<HTMLHeadingElement | null>) {
  useEffect(() => {
    const el = h1.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const chars = Array.from(el.querySelectorAll<HTMLElement>('.ch'));
    const cur = chars.map(() => 600);
    let mx = -1e5, my = -1e5, raf = 0;
    // Give every letter a fixed slot (its width at the base weight) so a heavier
    // letter grows in place instead of pushing the rest of the name along.
    const lock = () => {
      chars.forEach((c) => { c.style.cssText = ''; });
      const ls = parseFloat(getComputedStyle(el).letterSpacing) || 0;
      const widths = chars.map((c) => c.getBoundingClientRect().width);
      chars.forEach((c, i) => {
        Object.assign(c.style, { display: 'inline-block', width: `${widths[i] - ls}px`, marginRight: `${ls}px`, letterSpacing: '0', textAlign: 'center', fontWeight: String(Math.round(cur[i])) });
      });
    };
    let rt = 0;
    const onResize = () => { clearTimeout(rt); rt = window.setTimeout(() => { cur.fill(600); lock(); }, 150); };
    (document.fonts?.ready ?? Promise.resolve()).then(lock);
    addEventListener('resize', onResize);
    const move = (e: PointerEvent) => { mx = e.clientX; my = e.clientY; };
    addEventListener('pointermove', move, { passive: true });
    const loop = () => {
      if (el.dataset.mode === 'dom') {
        const reach = el.getBoundingClientRect().height * 1.25;
        chars.forEach((c, i) => {
          const r = c.getBoundingClientRect(), d = Math.hypot(r.left + r.width / 2 - mx, r.top + r.height / 2 - my);
          const target = 600 + 220 * Math.exp(-((d / reach) ** 2));
          cur[i] += (target - cur[i]) * 0.16;
          const v = Math.round(cur[i]);
          if (c.style.fontWeight !== String(v)) c.style.fontWeight = String(v);
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); clearTimeout(rt); removeEventListener('pointermove', move); removeEventListener('resize', onResize); };
  }, [h1]);
}

function fmtPrice(n: number) { return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

// What a market order sweeping levels 0..lvl of the live book would have filled at, right now.
function simulateSweep(side: 'bid' | 'ask', lvl: number, small: boolean) {
  const b = scene.book, buy = side === 'ask', px = buy ? b.ap : b.bp, qx = buy ? b.aq : b.bq;
  let qty = 0, notional = 0, n = 0;
  for (let i = 0; i <= lvl; i++) { if (!px[i]) break; qty += qx[i]; notional += px[i] * qx[i]; n++; }
  if (!qty) return null;
  // slippage against the best price; BTC's book is tight, so show dollars and enough bps digits to be non-zero
  const avg = notional / qty, diff = Math.abs(avg - px[0]), bps = diff / px[0] * 1e4;
  const slip = diff < 0.005 ? 'no slippage' : `slippage $${diff.toFixed(2)} (${bps < 0.1 ? bps.toFixed(3) : bps.toFixed(1)} bps)`;
  return small // one line on phones, so the name below never moves
    ? `${buy ? 'buy' : 'sell'} ${qty.toFixed(3)} BTC · avg ${fmtPrice(avg)}`
    : `simulated market ${buy ? 'buy' : 'sell'} · ${qty.toFixed(3)} BTC across ${n} level${n > 1 ? 's' : ''} · avg ${fmtPrice(avg)} · ${slip}`;
}

export default function Hero() {
  const h1 = useRef<HTMLHeadingElement>(null), cv = useRef<HTMLCanvasElement>(null), status = useRef<HTMLSpanElement>(null);
  const [introDone, setIntroDone] = useState(false);
  useWeightWave(h1);

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let first = false;
    try { first = !localStorage.getItem(INTRO_KEY); localStorage.setItem(INTRO_KEY, '1'); } catch { /* storage blocked */ }
    if (reduce) first = false;

    let market: MarketStatus = { state: 'connecting' }, typed = '', timer = 0, stopped = false, fill: null | { text: string; until: number } = null;
    let releaseName: () => void = () => {};
    const ready = new Promise<void>((res) => { releaseName = res; });
    const show = (t: string, cls: string) => { if (status.current) { status.current.textContent = t; status.current.dataset.s = cls; } };

    // 1. live order book
    const stopMarket = startMarket((s) => { market = s; });

    // 2. intro: type a line while the feed connects, then let the name assemble
    const startTicker = () => {
      setIntroDone(true);
      timer = window.setInterval(() => {
        if (fill && Date.now() < fill.until) show(fill.text, 'fill');
        else if (market.state === 'live') show(innerWidth < 640 ? `BTCUSDT ${fmtPrice(market.mid)} · live order book` : `BTCUSDT ${fmtPrice(market.mid)} · book updated ${Math.max(0, Date.now() - market.ts)} ms ago · live`, 'live');
        else if (market.state === 'replay') show(innerWidth < 640 ? 'BTCUSDT · replay' : 'BTCUSDT · replay · the live feed is not reachable from here', 'replay');
        else show('BTCUSDT · connecting…', 'wait');
      }, 100);
    };
    if (first) {
      const line = 'connecting to binance…';
      let i = 0;
      const type = () => {
        if (stopped) return;
        if (i <= line.length) { typed = line.slice(0, i++); show(typed, 'wait'); timer = window.setTimeout(type, 28); return; }
        const t0 = Date.now();
        const wait = () => {
          if (stopped) return;
          if (market.state === 'live') { show(`book synced · ${market.levels} levels a side`, 'live'); timer = window.setTimeout(() => { releaseName(); startTicker(); }, 650); }
          else if (market.state === 'replay' || Date.now() - t0 > 1800) { releaseName(); startTicker(); }
          else timer = window.setTimeout(wait, 60);
        };
        wait();
      };
      type();
    } else { releaseName(); startTicker(); }

    // 2b. click the book: sweep it with a market order (simulated against the live levels)
    scene.onSweep = (side, lvl) => { const text = simulateSweep(side, lvl, innerWidth < 640); if (text) fill = { text, until: Date.now() + 4500 }; };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      // the name is drawn on a canvas over the book, so clicks on it go through to the book
      if (!t?.closest('#home') || t.closest('.say, .acts, .now, .eyebrow, a, button')) return;
      scene.fire = { nx: e.clientX / innerWidth * 2 - 1, ny: e.clientY / innerHeight * 2 - 1 };
    };
    addEventListener('click', onClick);

    // 3. the name
    const stopGrains = h1.current && cv.current && !reduce ? startGrains(h1.current, cv.current, { intro: true, ready }) : (() => { if (h1.current) h1.current.dataset.mode = 'dom'; return () => {}; })();

    return () => { stopped = true; clearTimeout(timer); clearInterval(timer); stopMarket(); stopGrains(); removeEventListener('click', onClick); scene.onSweep = null; };
  }, []);

  const up = (d: number) => ({ initial: { opacity: 0, y: 14 }, animate: introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }, transition: { duration: 0.8, ease: EASE, delay: d } });
  return (
    <section className="hero" id="home">
      <BookReadout />
      <div className="w">
        <div className="eyebrow">
          <motion.span className="lbl" {...up(0.05)}>Systems + AI engineer · Bengaluru</motion.span>
          <span className="feed lbl" ref={status} aria-live="off" />
        </div>
        <h1 ref={h1} aria-label="Snehangshu Roy" data-mode="pre">
          <span className="nm" aria-hidden="true">
            {NAME.map((w, wi) => (
              <span key={w}>
                <span className="wd">{w.split('').map((c, ci) => <span className="ch" key={ci}>{c}</span>)}</span>
                {wi < NAME.length - 1 ? ' ' : ''}
              </span>
            ))}
          </span>
          <canvas ref={cv} className="namefx" aria-hidden="true" />
        </h1>
        <div className="hero-foot">
          <motion.div {...up(0.35)}>
            <p className="say">I build <RotatingWord /><br />that prove they work.</p>
            <div className="acts">
              <MagneticLink className="b p" href="#work">
                See the work
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
              </MagneticLink>
              <CopyEmail />
              <MagneticLink className="b" href={SITE.resume} target="_blank" rel="noopener">Résumé <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2.5v8M4.5 7.5L8 11l3.5-3.5M3 13.5h10" /></svg></MagneticLink>
            </div>
          </motion.div>
          <motion.div className="now" {...up(0.5)}>
            <span className="lbl">Now</span>
            <p>Taking <b>quant</b> from paper trading to live orders. The bar for done: my record and the exchange&apos;s agree exactly, for every order.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
