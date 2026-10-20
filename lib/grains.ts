// Crisp heading text that breaks into grains where the pointer touches it.
// At rest the canvas shows the text pixel-for-pixel; touched cells are cut out
// and drawn as small dots that scatter, then spring back and merge into the type.

export function startGrains(h1: HTMLElement, cv: HTMLCanvasElement, opts: { intro: boolean }) {
  const ctx = cv.getContext('2d');
  if (!ctx) return () => {};
  const PAD = 110;
  let W = 0, H = 0, dpr = 1, G = 3, DOT = 2;
  let img: ImageData | null = null, buf: Uint32Array | null = null, baseBuf: Uint32Array | null = null, baseCanvas: HTMLCanvasElement | null = null;
  let n = 0, awake = 0, mx = -1e5, my = -1e5, pmx = -1e5, pmy = -1e5, on = false, introDone = !opts.intro;
  let hx = new Float32Array(0), hy = hx, px = hx, py = hx, vx = hx, vy = hx, wt = hx, dl: Float32Array | null = null;
  let al = new Uint8Array(0);

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2); G = Math.round(3 * dpr); DOT = Math.max(2, Math.round(2.2 * dpr));
    const r = h1.getBoundingClientRect(), cs = getComputedStyle(h1);
    W = Math.ceil((r.width + PAD * 2) * dpr); H = Math.ceil((r.height + PAD * 2) * dpr);
    cv.width = W; cv.height = H; cv.style.width = W / dpr + 'px'; cv.style.height = H / dpr + 'px'; cv.style.left = -PAD + 'px'; cv.style.top = -PAD + 'px';
    const off = document.createElement('canvas'); off.width = W; off.height = H;
    const o = off.getContext('2d')!;
    o.fillStyle = '#ededed'; o.textBaseline = 'alphabetic';
    o.font = `${cs.fontWeight} ${parseFloat(cs.fontSize) * dpr}px ${cs.fontFamily}`;
    try { (o as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = parseFloat(cs.letterSpacing) * dpr + 'px'; } catch { /* older browsers */ }
    const asc = o.measureText('H').actualBoundingBoxAscent || parseFloat(cs.fontSize) * 0.72 * dpr;
    h1.querySelectorAll<HTMLElement>('.wd').forEach((w) => {
      const wr = w.getBoundingClientRect(), x0 = (wr.left - r.left + PAD) * dpr, lh = wr.height * dpr, y0 = (wr.top - r.top + PAD) * dpr + (lh + asc) / 2 - asc * 0.04;
      o.fillText(w.textContent || '', x0, y0);
    });
    const id = o.getImageData(0, 0, W, H);
    baseBuf = new Uint32Array(id.data.buffer.slice(0)); baseCanvas = off;
    const d = id.data, cells: number[] = [];
    for (let y = 0; y + G <= H; y += G) for (let x = 0; x + G <= W; x += G) {
      let sum = 0;
      for (let yy = 0; yy < G; yy++) { const row = ((y + yy) * W + x) * 4 + 3; for (let xx = 0; xx < G; xx++) sum += d[row + xx * 4]; }
      const a = sum / (G * G); if (a > 22) cells.push(x, y, a);
    }
    n = cells.length / 3;
    hx = new Float32Array(n); hy = new Float32Array(n); px = new Float32Array(n); py = new Float32Array(n);
    vx = new Float32Array(n); vy = new Float32Array(n); wt = new Float32Array(n); al = new Uint8Array(n);
    for (let i = 0; i < n; i++) { hx[i] = px[i] = cells[i * 3]; hy[i] = py[i] = cells[i * 3 + 1]; al[i] = Math.min(255, cells[i * 3 + 2] * 1.15); wt[i] = 0.55 + Math.random() * 0.9; }
    img = ctx!.createImageData(W, H); buf = new Uint32Array(img.data.buffer); awake = 0; dl = null;
    if (!introDone) {
      introDone = true; dl = new Float32Array(n);
      for (let q = 0; q < n; q++) {
        const ang = Math.random() * 6.283, rad = (0.25 + Math.random() * 0.75) * H * 0.9;
        px[q] = hx[q] + Math.cos(ang) * rad * 1.8; py[q] = hy[q] + Math.sin(ang) * rad * 0.7; dl[q] = (hx[q] / W) * 26 + Math.random() * 12;
      }
      awake = n;
    }
    ctx!.clearRect(0, 0, W, H); ctx!.drawImage(off, 0, 0);
    document.documentElement.classList.add('fx');
  }

  function dot(x: number, y: number, c: number, sz: number) {
    const x0 = Math.round(x), y0 = Math.round(y);
    for (let yy = 0; yy < sz; yy++) { const Y = y0 + yy; if (Y < 0 || Y >= H) continue; const ro = Y * W;
      for (let xx = 0; xx < sz; xx++) { const X = x0 + xx; if (X < 0 || X >= W) continue; buf![ro + X] = c; } }
  }

  function step() {
    if (!n || !buf || !baseBuf || !img) return;
    const Rr = 64 * dpr, R2 = Rr * Rr, near = on && mx > -Rr && my > -Rr && mx < W + Rr && my < H + Rr;
    if (!near && !awake) return;
    let mvx = mx - pmx, mvy = my - pmy; if (Math.abs(mvx) > 200 || Math.abs(mvy) > 200) { mvx = 0; mvy = 0; } pmx = mx; pmy = my;
    buf.set(baseBuf);
    let moved = 0; const loose: number[] = [];
    const cut = (i: number) => { const x0 = hx[i] | 0, y0 = hy[i] | 0; for (let yy = 0; yy < G; yy++) { const ro = (y0 + yy) * W + x0; for (let xx = 0; xx < G; xx++) buf![ro + xx] = 0; } };
    for (let i = 0; i < n; i++) {
      if (dl && dl[i] > 0) { dl[i] -= 1; moved++; cut(i); loose.push(i); continue; }
      let x = px[i], y = py[i]; const w = wt[i];
      let ax = (hx[i] - x) * 0.055, ay = (hy[i] - y) * 0.055;
      if (near) {
        const dx = x - mx, dy = y - my, dd = dx * dx + dy * dy;
        if (dd < R2) { const dist = Math.sqrt(dd) + 0.01; let f = 1 - dist / Rr; f = f * f * 7.5 * dpr * w;
          ax += dx / dist * f + mvx * 0.06 * f / dpr; ay += dy / dist * f + mvy * 0.06 * f / dpr + (Math.random() - 0.5) * f * 0.6; }
      }
      let nvx = (vx[i] + ax) * 0.87, nvy = (vy[i] + ay) * 0.87; x += nvx; y += nvy;
      if (Math.abs(x - hx[i]) + Math.abs(y - hy[i]) < 1.2 * dpr && Math.abs(nvx) + Math.abs(nvy) < 0.35 * dpr) { x = hx[i]; y = hy[i]; nvx = nvy = 0; }
      vx[i] = nvx; vy[i] = nvy; px[i] = x; py[i] = y;
      if (x !== hx[i] || y !== hy[i]) { moved++; cut(i); loose.push(i); }
    }
    for (const j of loose) {
      const sp = Math.abs(vx[j]) + Math.abs(vy[j]), t = Math.min(1, sp / (5 * dpr));
      let r = 237, g = 237, b = 237;
      if (vx[j] < 0) { r = 237 - 175 * t; g = 237 - 7 * t; b = 237 - 41 * t; } else { r = 237 + 18 * t; g = 237 - 147 * t; b = 237 - 127 * t; }
      const od = Math.abs(px[j] - hx[j]) + Math.abs(py[j] - hy[j]), sz = Math.round(G - (G - DOT) * Math.min(1, od / (G * 2.5)));
      dot(px[j], py[j], (al[j] << 24) | (b << 16) | (g << 8) | r, sz);
    }
    awake = moved; if (dl && !moved) dl = null;
    if (!awake && !near) { ctx!.clearRect(0, 0, W, H); ctx!.drawImage(baseCanvas!, 0, 0); return; }
    ctx!.putImageData(img, 0, 0);
  }

  const ptr = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); mx = (e.clientX - r.left) * dpr; my = (e.clientY - r.top) * dpr; if (!on) { pmx = mx; pmy = my; } on = true; };
  const off = () => { on = false; };
  addEventListener('pointermove', ptr, { passive: true }); addEventListener('pointerdown', ptr, { passive: true });
  document.addEventListener('pointerleave', off); addEventListener('blur', off);
  let raf = 0, alive = true;
  const loop = () => { step(); if (alive) raf = requestAnimationFrame(loop); };
  const go = () => { try { build(); } catch { document.documentElement.classList.remove('fx'); } };
  (document.fonts?.ready ?? Promise.resolve()).then(() => setTimeout(() => { if (alive) { go(); loop(); } }, 50));
  let rt = 0; const onResize = () => { clearTimeout(rt); rt = window.setTimeout(go, 200); };
  addEventListener('resize', onResize);

  return () => {
    alive = false; cancelAnimationFrame(raf);
    removeEventListener('pointermove', ptr); removeEventListener('pointerdown', ptr); document.removeEventListener('pointerleave', off);
    removeEventListener('blur', off); removeEventListener('resize', onResize);
    document.documentElement.classList.remove('fx');
  };
}
