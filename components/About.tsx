'use client';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';

const TEXT = "I'm Snehangshu, studying computer science at Scaler School of Technology and BITS Pilani. I like problems where almost right isn't good enough: a backtest that must match live trading to the satoshi, an order book where nanoseconds count, a grader that can never award more than the rubric allows. I write the test that would catch the mistake before I write the code.";
const WORDS = TEXT.split(' ');

function Word({ w, i, p }: { w: string; i: number; p: MotionValue<number> }) {
  const n = WORDS.length;
  const opacity = useTransform(p, [i / n, Math.min(1, (i + 3) / n)], [0.22, 1]);
  return <motion.span style={{ opacity }}>{w} </motion.span>;
}

export default function About() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] });
  return (
    <section className="about" id="about">
      <div className="w">
        <p className="read" ref={ref}>{WORDS.map((w, i) => <Word key={i} w={w} i={i} p={scrollYProgress} />)}</p>
        <ul className="svc">
          {[
            ['Backend and systems', 'APIs, data pipelines, real-time services, performance work in Rust, C++ or Python'],
            ['AI agents and RAG', 'Document search, LLM features with evidence and fallbacks, browser automation'],
            ['Cloud infrastructure', 'Docker, Kubernetes, Terraform on AWS, CI/CD with security gates'],
          ].map(([b, s], i) => (
            <motion.li key={b} initial={{ opacity: 0.35, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }}
              transition={{ type: 'spring', stiffness: 160, damping: 22, delay: i * 0.06 }}><b>{b}</b><span>{s}</span></motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
