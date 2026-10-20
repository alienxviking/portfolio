import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FEATURED } from '@/lib/data';
import CaseFigure from '@/components/CaseFigure';
import Diagram from '@/components/Diagram';
import Footer from '@/components/Footer';
import { CaseDirector } from '@/components/Director';

export function generateStaticParams() {
  return FEATURED.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = FEATURED.find((f) => f.slug === slug);
  if (!p) return {};
  return { title: p.title, description: `${p.th} ${p.bd}`.slice(0, 300), openGraph: { title: `${p.title} · Snehangshu Roy`, description: p.th } };
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = FEATURED.findIndex((f) => f.slug === slug);
  if (i < 0) notFound();
  const p = FEATURED[i], next = FEATURED[(i + 1) % FEATURED.length];
  return (
    <>
      <CaseDirector shape={p.shape} />
      <main className="case" style={{ ['--acc' as string]: p.acc }}>
        <div className="w">
          <Link className="back" href="/#work">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M13 8H3M7 4L3 8l4 4" /></svg>
            All work
          </Link>
          <header className="case-head">
            <div className="k"><b>{p.n} / 04</b><span className="lbl">{p.tag}</span></div>
            <h1>{p.title}</h1>
            <p className="th">{p.th}</p>
            <div className="links" style={{ marginTop: 28 }}>
              {p.links.map(([label, href], k) => (
                <a key={href} className={'b' + (k === 0 ? ' p' : '')} href={href} target="_blank" rel="noopener noreferrer">
                  {label}
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M5 11L11 5M6 5h5v5" /></svg>
                </a>
              ))}
            </div>
          </header>
          <dl className="meta">{p.meta.map(([dt, dd]) => <div key={dt}><dt>{dt}</dt><dd>{dd}</dd></div>)}</dl>
          <Diagram kind={p.slug} />
          <div className="case-body">
            <div className="text">
              {p.sections.map((s) => (
                <section className="case-sec" key={s.h}>
                  <h2>{s.h}</h2>
                  {s.p?.map((t, k) => <p key={k}>{t}</p>)}
                  {s.list && <ul>{s.list.map((t, k) => <li key={k}>{t}</li>)}</ul>}
                </section>
              ))}
            </div>
            <aside className="fig"><CaseFigure kind={p.figure} /></aside>
          </div>
          <nav className="nextp" aria-label="More case studies">
            <Link href="/#work"><span className="lbl">Back to</span><b>All work</b></Link>
            <Link href={`/work/${next.slug}`} style={{ textAlign: 'right' }}><span className="lbl">Next case study</span><b>{next.title} →</b></Link>
          </nav>
        </div>
      </main>
      <Footer />
    </>
  );
}
