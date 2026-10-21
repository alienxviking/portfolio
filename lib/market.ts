// Live BTCUSDT order book from Binance's public market-data stream (no key needed).
// Writes cumulative depth into the shared scene so the hero landscape is the real book.
import { scene } from './scene';

const ENDPOINTS = [
  'wss://data-stream.binance.vision/ws/btcusdt@depth20@100ms',
  'wss://stream.binance.com:9443/ws/btcusdt@depth20@100ms',
];

export type MarketStatus =
  | { state: 'connecting' }
  | { state: 'live'; mid: number; ts: number; levels: number }
  | { state: 'replay' };

type Level = [string, string];

function cumulative(levels: Level[], out: Float32Array) {
  out[0] = 0;
  for (let i = 0; i < out.length - 1; i++) out[i + 1] = out[i] + (levels[i] ? parseFloat(levels[i][1]) : 0);
  return out[out.length - 1];
}

export function startMarket(onStatus: (s: MarketStatus) => void) {
  let ws: WebSocket | null = null, idx = 0, closed = false, gotData = false;
  const bids = new Float32Array(21), asks = new Float32Array(21);
  onStatus({ state: 'connecting' });

  // no data within 5 s: say so and keep the simulated landscape
  const giveUp = setTimeout(() => { if (!gotData) { scene.book.live = false; onStatus({ state: 'replay' }); } }, 5000);

  const connect = () => {
    if (closed || idx >= ENDPOINTS.length) { if (!gotData) onStatus({ state: 'replay' }); return; }
    try { ws = new WebSocket(ENDPOINTS[idx]); } catch { idx++; connect(); return; }
    ws.onmessage = (e) => {
      let d: { bids?: Level[]; asks?: Level[] };
      try { d = JSON.parse(e.data as string); } catch { return; }
      if (!d.bids?.length || !d.asks?.length) return;
      const tb = cumulative(d.bids, bids), ta = cumulative(d.asks, asks), max = Math.max(tb, ta) || 1;
      for (let i = 0; i < 21; i++) { scene.book.bids[i] = bids[i] / max; scene.book.asks[i] = asks[i] / max; }
      scene.book.live = true; gotData = true;
      const mid = (parseFloat(d.bids[0][0]) + parseFloat(d.asks[0][0])) / 2;
      onStatus({ state: 'live', mid, ts: Date.now(), levels: Math.min(d.bids.length, d.asks.length) });
    };
    ws.onerror = () => { ws?.close(); };
    ws.onclose = () => {
      if (closed) return;
      if (!gotData) { idx++; connect(); }               // try the next endpoint
      else setTimeout(connect, 2000);                    // dropped mid-stream: reconnect
    };
  };
  connect();

  return () => { closed = true; clearTimeout(giveUp); scene.book.live = false; ws?.close(); };
}
