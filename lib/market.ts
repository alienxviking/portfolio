// Live BTCUSDT order book from Binance's public market-data stream (no key needed).
// Writes cumulative depth into the shared scene so the hero landscape is the real book.
import { scene } from './scene';

// one socket for both the book and the trade tape
const STREAMS = 'stream?streams=btcusdt@depth20@100ms/btcusdt@aggTrade';
const ENDPOINTS = [
  `wss://data-stream.binance.vision/${STREAMS}`,
  `wss://stream.binance.com:9443/${STREAMS}`,
];

export type MarketStatus =
  | { state: 'connecting' }
  | { state: 'live'; mid: number; ts: number; levels: number }
  | { state: 'replay' };

type Level = [string, string];

// Trades become pulses on the side they hit: a buyer lifting offers hits the asks.
// Trades a few ms apart on the same side are merged so a burst reads as one bigger pulse.
let pend = { side: 'ask' as 'bid' | 'ask', qty: 0, t: 0 };
function onTrade(qty: number, buyerIsMaker: boolean) {
  if (scene.shape !== 'depth' || !scene.book.live) return; // hero off screen: nothing to draw
  const side = buyerIsMaker ? 'bid' : 'ask', now = performance.now();
  if (side === pend.side && now - pend.t < 120) { pend.qty += qty; return; }
  if (pend.qty > 0) push(pend.side, pend.qty, pend.t);
  pend = { side, qty, t: now };
}
function push(side: 'bid' | 'ask', qty: number, t: number) {
  if (qty < 0.0005) return; // dust (about $40)
  const amp = Math.min(1, Math.max(0.2, Math.log10(qty * 1000) / 4)); // small trades faint, 10 BTC full
  if (scene.pulses.length >= 24) scene.pulses.shift();
  scene.pulses.push({ side, amp, t });
}

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
      let msg: { stream?: string; data?: { bids?: Level[]; asks?: Level[]; q?: string; m?: boolean } };
      try { msg = JSON.parse(e.data as string); } catch { return; }
      const d = msg.data;
      if (!d) return;
      if (msg.stream?.endsWith('aggTrade')) { onTrade(parseFloat(d.q ?? '0'), !!d.m); return; }
      if (!d.bids?.length || !d.asks?.length) return;
      const tb = cumulative(d.bids, bids), ta = cumulative(d.asks, asks), max = Math.max(tb, ta) || 1;
      for (let i = 0; i < 21; i++) { scene.book.bids[i] = bids[i] / max; scene.book.asks[i] = asks[i] / max; }
      const b = scene.book;
      for (let i = 0; i < 20; i++) {
        const bl = d.bids[i], al = d.asks[i];
        b.bp[i] = bl ? parseFloat(bl[0]) : 0; b.bq[i] = bl ? parseFloat(bl[1]) : 0; b.bc[i] = bids[i + 1];
        b.ap[i] = al ? parseFloat(al[0]) : 0; b.aq[i] = al ? parseFloat(al[1]) : 0; b.ac[i] = asks[i + 1];
      }
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
