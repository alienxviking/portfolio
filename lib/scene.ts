// Shared, mutable state the particle field reads every frame.
// UI components write to it; nothing here triggers React renders.

export type Shape = 'depth' | 'quant' | 'redpen' | 'lob' | 'sift' | 'sphere' | 'burst';
export type Op = 'cancel' | 'add';
export type SiftMode = 'kw' | 'se' | 'fused';

// Median ns per operation, from the order-book REPORT.md
export const OB: Record<Op, { map: number; heap: number; ours: number }> = {
  cancel: { map: 201.6, heap: 471.2, ours: 38.3 },
  add: { map: 113.4, heap: 71.2, ours: 56.7 },
};

export const scene = {
  shape: 'depth' as Shape,
  dim: 1, // global brightness, lowered on case-study pages
  conv: 1, // quant: 0 = paper and backtest apart, 1 = one line
  marks: 1,
  marksT: 1, // redpen: 1 = marked, 0 = clean copy
  op: 'cancel' as Op,
  race: null as null | { t0: number },
  len: [201.6 / 471.2, 1, 38.3 / 471.2],
  sift: 'fused' as SiftMode,
  onRace: null as null | ((text: string | null) => void),
  // live BTCUSDT book: cumulative qty at 0..20 levels from the touch, normalised so the deeper side ends at 1
  book: { live: false, bids: new Float32Array(21), asks: new Float32Array(21) },
  workIdx: -1, // which featured project the home stage is showing (-1 = stage not active)
};
