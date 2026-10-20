'use client';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

function Odo({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  let di = 0;
  return (
    <span className="odo" ref={ref} aria-label={value}>
      {value.split('').map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i} aria-hidden="true">{ch}</span>;
        const d = +ch, k = di++;
        return (
          <motion.span key={i} className="col" aria-hidden="true" initial={{ y: 0 }} animate={{ y: inView ? `-${d}em` : 0 }}
            transition={{ type: 'spring', stiffness: 90, damping: 18, delay: k * 0.07 }}>
            {Array.from({ length: 10 }, (_, n) => <span key={n}>{n}</span>)}
          </motion.span>
        );
      })}
    </span>
  );
}

const ITEMS: { v: string; u?: string; pre?: string; d: string; sm?: boolean }[] = [
  { v: '797', d: 'tests in quant, passing in debug and release' },
  { v: '97.9', u: 'M', d: 'market-data frames captured, none missing' },
  { v: '38.3', u: 'ns', d: 'median cancel in my C++ order book' },
  { v: '0.00000000', pre: 'Δ ', d: 'paper vs backtest P&L after 14 live days', sm: true },
];

export default function Numbers() {
  return (
    <section className="nums" aria-label="Numbers">
      <div className="w">
        {ITEMS.map((it) => (
          <motion.div className="num" key={it.d} initial={{ opacity: 0.35, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}
            transition={{ type: 'spring', stiffness: 160, damping: 22 }}>
            <div className={'v' + (it.sm ? ' sm' : '')}>{it.pre}<Odo value={it.v} />{it.u && <span className="u">{it.u}</span>}</div>
            <div className="d">{it.d}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
