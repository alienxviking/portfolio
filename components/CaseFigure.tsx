/* eslint-disable @next/next/no-img-element */
import { OB } from '@/lib/scene';

function QuantFig() {
  const rows: [string, string, string, string?][] = [
    ['BTCUSDT', '', '', 'sym'], ['fills', '824', '824'], ['cash', '31.64743842', '31.64743842'], ['realized', '+0.7312598', '+0.7312598'], ['fees', '69.08382138', '69.08382138'],
    ['ETHUSDT', '', '', 'sym'], ['fills', '822', '822'], ['cash', '97.65757574', '97.65757574'], ['realized', '−0.1335', '−0.1335'], ['fees', '2.20892426', '2.20892426'],
  ];
  return (
    <div className="card">
      <h3>M5 · 14-day live paper run vs backtest over the same window · 18 Sep – 2 Oct 2026</h3>
      <table className="tbl">
        <thead><tr><th /><th>PAPER</th><th>BACKTEST</th></tr></thead>
        <tbody>{rows.map(([a, b, c, k], i) => <tr key={i} className={k}><td>{a}</td><td>{b}</td><td>{c}</td></tr>)}</tbody>
      </table>
      <div className="eqok">Identical on both symbols, to the satoshi</div>
    </div>
  );
}

function LobFig() {
  const max = 471.2;
  const group = (op: 'add' | 'cancel') => (
    <>
      <div className="gtitle">{op}_order</div>
      {(['map', 'heap', 'ours'] as const).map((k) => (
        <div key={k} className={'brow' + (k === 'ours' ? ' ours' : '')}>
          <span>{k === 'map' ? 'std::map' : k}</span>
          <div className="tr"><div className="fl" style={{ width: `${(OB[op][k] / max) * 100}%` }} /></div>
          <span>{OB[op][k]} ns</span>
        </div>
      ))}
    </>
  );
  const metrics: [string, string, string, string][] = [
    ['Total time', '126.2 ms', '135.7 ms', '33.4 ms'], ['ns / BBO', '1.69', '3.04', '1.48'], ['IPC', '0.80', '0.99', '1.18'],
    ['L1d misses', '199.6M', '318.5M', '43.8M'], ['Cache misses', '63.0M', '95.7M', '14.2M'], ['dTLB misses', '9.31M', '16.57M', '5.91M'],
  ];
  return (
    <>
      <div className="card"><h3>Median ns per operation · lower is better</h3><div className="bars">{group('add')}{group('cancel')}</div></div>
      <div className="card">
        <h3>perf stat, 5 runs · A std::map · B heap · C ours</h3>
        <table className="tbl">
          <thead><tr><th /><th>A</th><th>B</th><th>C</th></tr></thead>
          <tbody>{metrics.map(([m, a, b, c]) => <tr key={m}><td>{m}</td><td>{a}</td><td>{b}</td><td className="hi">{c}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}

export default function CaseFigure({ kind }: { kind: 'quant' | 'redpen' | 'lob' | 'sift' }) {
  if (kind === 'quant') return <QuantFig />;
  if (kind === 'lob') return <LobFig />;
  if (kind === 'redpen') return (
    <div className="card">
      <h3>fixtures/example-annotated.pdf · a marked page from the test suite</h3>
      <img className="full" src="/work/redpen-annotated.jpg" alt="An answer paper marked by RedPen: mistakes boxed in red with corrections in the margin" loading="lazy" />
    </div>
  );
  return (
    <div className="card">
      <h3>sift · a processed document and the library</h3>
      <div className="shots">
        <img src="/work/sift-doc.jpg" alt="sift showing an extracted document next to its text" loading="lazy" />
        <img src="/work/sift-library.jpg" alt="sift's document library with processing status" loading="lazy" />
      </div>
    </div>
  );
}
