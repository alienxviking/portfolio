'use client';
/* eslint-disable @next/next/no-img-element */
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';

const TEXT = "I'm Snehangshu, studying computer science at Scaler School of Technology and BITS Pilani. I like problems where almost right isn't good enough: a backtest that must match live trading to the satoshi, an order book where nanoseconds count, a grader that can never award more than the rubric allows. I write the test that would catch the mistake before I write the code.";
const WORDS = TEXT.split(' ');

const STACK: [string, string[]][] = [
  ['Languages', ['Rust', 'C++', 'Python', 'TypeScript', 'Java', 'SQL']],
  ['Backend', ['FastAPI', 'Node.js', 'Express', 'Spring Boot', 'Celery', 'Socket.io']],
  ['Data', ['PostgreSQL', 'pgvector', 'Redis', 'Parquet / Arrow']],
  ['AI', ['Claude · Gemini · Groq', 'RAG', 'LLM evals', 'Browser agents']],
  ['Infra', ['Docker', 'Kubernetes', 'Helm', 'Terraform', 'AWS', 'Argo CD', 'GitHub Actions']],
];

function Word({ w, i, p }: { w: string; i: number; p: MotionValue<number> }) {
  const n = WORDS.length;
  const opacity = useTransform(p, [i / n, Math.min(1, (i + 3) / n)], [0.22, 1]);
  return <motion.span style={{ opacity }}>{w} </motion.span>;
}

const rise = (d = 0) => ({ initial: { opacity: 0.35, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.4 }, transition: { type: 'spring', stiffness: 160, damping: 22, delay: d } } as const);

export default function About() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] });
  return (
    <section className="about" id="about">
      <div className="w">
        <div>
          <p className="read" ref={ref}>{WORDS.map((w, i) => <Word key={i} w={w} i={i} p={scrollYProgress} />)}</p>
          <div className="stack" aria-label="Skills">
            {STACK.map(([g, items], gi) => (
              <motion.div className="stack-row" key={g} {...rise(gi * 0.05)}>
                <span className="lbl">{g}</span>
                <div className="chips">{items.map((t) => <span className="chip" key={t}>{t}</span>)}</div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="about-side">
          <motion.figure className="portrait" {...rise()}>
            <img src="/me.jpg" alt="Snehangshu Roy" width={800} height={1000} loading="lazy" />
            <figcaption><span>Snehangshu Roy</span><span>Bengaluru · 2026</span></figcaption>
          </motion.figure>
          <ul className="svc">
            {[
              ['Backend and systems', 'APIs, data pipelines, real-time services, performance work in Rust, C++ or Python'],
              ['AI agents and RAG', 'Document search, LLM features with evidence and fallbacks, browser automation'],
              ['Cloud infrastructure', 'Docker, Kubernetes, Terraform on AWS, CI/CD with security gates'],
            ].map(([b, s], i) => (
              <motion.li key={b} {...rise(i * 0.06)}><b>{b}</b><span>{s}</span></motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
