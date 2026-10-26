// Runs the order-book benchmark off the main thread so the page stays smooth.
// Message in:  { n, runs }
// Messages out: { type: 'progress', impl } · { type: 'done', results } · { type: 'error', message }
/* global createLob */
let mod = null;

const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

self.onmessage = async (e) => {
  try {
    if (!mod) { importScripts('/wasm/lob.js'); mod = await createLob(); }
    const { n = 100000, runs = 5 } = e.data || {};
    const names = ['map', 'heap', 'ours'];
    const add = [[], [], []], cancel = [[], [], []];
    // a throwaway pass per implementation, so first-run allocation isn't measured
    for (let i = 0; i < 3; i++) mod._lob_run(i, 20000, 1);
    for (let r = 0; r < runs; r++) {
      // rotate the order each run so no implementation always goes first
      for (let k = 0; k < 3; k++) {
        const i = (k + r) % 3;
        self.postMessage({ type: 'progress', impl: names[i], run: r + 1, runs });
        add[i].push(mod._lob_run(i, n, 1000 + r));
        cancel[i].push(mod._lob_last_cancel_ns());
        if (mod._lob_last_cancel_ok() !== n) throw new Error('a cancel failed, results discarded');
      }
    }
    const results = {};
    names.forEach((nm, i) => { results[nm] = { add: +median(add[i]).toFixed(1), cancel: +median(cancel[i]).toFixed(1) }; });
    self.postMessage({ type: 'done', results, n, runs });
  } catch (err) {
    self.postMessage({ type: 'error', message: String(err && err.message || err) });
  }
};
