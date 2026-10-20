import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="case">
      <div className="w case-head">
        <div className="lbl" style={{ marginBottom: 18 }}>404</div>
        <h1>Nothing here.</h1>
        <p className="th">That page doesn&apos;t exist. The work does.</p>
        <div className="links" style={{ marginTop: 28 }}><Link className="b p" href="/">Back home</Link></div>
      </div>
    </main>
  );
}
