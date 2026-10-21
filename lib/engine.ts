// The particle field: ~24K GPU points that morph between shapes.
// Each shape fills target positions/colours; points ease toward them every frame.
import * as THREE from 'three';
import { OB, scene as S, type Shape } from './scene';

type View = { c: [number, number, number]; l: [number, number, number]; gx: number; gy: number; ry: number; s: number };

export function startEngine(canvas: HTMLCanvasElement, opts: { small: boolean; reduce: boolean }) {
  const { small, reduce } = opts;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0x08080a, 1);
  const PR = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
  renderer.setPixelRatio(PR);
  const scene3 = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 2.4, 6.4);

  const N = small ? 11000 : 24000;
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), tgt = new Float32Array(N * 3), tcol = new Float32Array(N * 3);
  const rnd = new Float32Array(N), size = new Float32Array(N), spd = new Float32Array(N);
  let sd = 7;
  const R = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
  for (let i = 0; i < N; i++) {
    rnd[i] = R(); size[i] = 0.6 + R() * 1.1; spd[i] = 0.03 + R() * 0.05;
    const th = R() * 6.283, ph = Math.acos(2 * R() - 1), rr = 7 + R() * 6;
    pos[i * 3] = rr * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = rr * Math.cos(ph); pos[i * 3 + 2] = rr * Math.sin(ph) * Math.sin(th);
    col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = 0.5;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPix: { value: PR }, uScale: { value: small ? 1.2 : 1.0 }, uDim: { value: 1 } },
    vertexShader: `
      uniform float uTime; uniform float uPix; uniform float uScale;
      attribute vec3 aColor; attribute float aSize; attribute float aRand;
      varying vec3 vC; varying float vA;
      void main(){
        vec3 p = position + 0.012 * vec3(sin(uTime*1.3 + aRand*61.0), cos(uTime*1.1 + aRand*47.0), sin(uTime*0.9 + aRand*29.0));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPix * uScale * (13.0 / -mv.z);
        vC = aColor; vA = smoothstep(18.0, 3.0, -mv.z) * (0.78 + 0.22 * sin(uTime*2.0 + aRand*40.0));
      }`,
    fragmentShader: `
      uniform float uDim; varying vec3 vC; varying float vA;
      void main(){ float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)); a *= a; gl_FragColor = vec4(vC * (1.0 + 0.6*a), a * vA * uDim); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const group = new THREE.Group();
  group.add(new THREE.Points(geo, mat));
  scene3.add(group);

  // faint deep starfield
  {
    const n = small ? 700 : 1800, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = (Math.random() - 0.5) * 40; a[i * 3 + 1] = (Math.random() - 0.5) * 24; a[i * 3 + 2] = -6 - Math.random() * 22; }
    const g3 = new THREE.BufferGeometry(); g3.setAttribute('position', new THREE.BufferAttribute(a, 3));
    scene3.add(new THREE.Points(g3, new THREE.PointsMaterial({ color: 0x8f9bb8, size: 0.045, sizeAttenuation: true, transparent: true, opacity: 0.55, depthWrite: false })));
  }

  const set = (i: number, x: number, y: number, z: number, r: number, g: number, b: number) => {
    tgt[i * 3] = x; tgt[i * 3 + 1] = y; tgt[i * 3 + 2] = z; tcol[i * 3] = r; tcol[i * 3 + 1] = g; tcol[i * 3 + 2] = b;
  };
  const EQ = (() => {
    let s = 26, v = 0; const a: number[] = [];
    const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    for (let i = 0; i <= 300; i++) { v += (r() - 0.45) * 0.2; a.push(v); }
    const mn = Math.min(...a), mx = Math.max(...a);
    return a.map((x) => (x - mn) / (mx - mn));
  })();
  const eqAt = (u: number) => { const f = u * 300, i = Math.min(299, Math.floor(f)), t = f - i; return EQ[i] + (EQ[i + 1] - EQ[i]) * t; };
  let ripX = 9, ripZ = 9, liveMix = 0;
  const bS = new Float32Array(21), aS = new Float32Array(21);
  const curve = (arr: Float32Array, u: number) => { const f = u * 20, i = Math.min(19, Math.floor(f)), t = f - i; return arr[i] + (arr[i + 1] - arr[i]) * t; };
  let raceTick = 0;

  const shapes: Record<Shape, (t: number) => void> = {
    depth(t) {
      if (S.book.live) { for (let k = 0; k < 21; k++) { bS[k] += (S.book.bids[k] - bS[k]) * 0.12; aS[k] += (S.book.asks[k] - aS[k]) * 0.12; } liveMix += (1 - liveMix) * 0.03; }
      else liveMix *= 0.97;
      const GW = small ? 120 : 180, GH = Math.max(2, Math.floor(N / GW));
      for (let i = 0; i < N; i++) {
        const gx = i % GW, gz = Math.min(GH - 1, Math.floor(i / GW)), x = -3.2 + 6.4 * gx / (GW - 1), z = -1.8 + 3.6 * gz / (GH - 1), d = Math.abs(x);
        const u = Math.min(1, (d - 0.07) / 3.1), sim = Math.pow(Math.max(0, u), 0.62);
        const depth = d < 0.07 ? 0 : 0.12 + 1.15 * (liveMix > 0.001 ? liveMix * curve(x < 0 ? bS : aS, u) + (1 - liveMix) * sim : sim);
        const wob = 0.07 * Math.sin(z * 3.6 + t * 1.1 + x * 1.7) + 0.045 * Math.sin(x * 7.0 - t * 0.9 + z) + 0.03 * Math.sin((x + z) * 11.0 + t * 2.2);
        const rr = Math.hypot(x - ripX, z - ripZ), rip = 0.32 * Math.exp(-rr * rr * 1.6) * Math.sin(rr * 9.0 - t * 7.0);
        const y = depth * (0.85 + 0.15 * Math.sin(z * 1.3 + t * 0.6)) + wob + rip - 0.9, h = Math.min(1, depth + 0.25), dm = 0.62;
        if (d < 0.07) set(i, x, y, z, 0.7, 0.7, 0.75);
        else if (x < 0) set(i, x, y, z, (0.16 + 0.2 * h) * dm, (0.55 + 0.4 * h) * dm, (0.5 + 0.3 * h) * dm);
        else set(i, x, y, z, (0.6 + 0.4 * h) * dm, (0.18 + 0.2 * h) * dm, (0.26 + 0.2 * h) * dm);
      }
    },
    quant(t) {
      const conv = S.conv, sep = 0.75 * (1 - conv), half = Math.floor(N * 0.45);
      for (let i = 0; i < N; i++) {
        if (i < half * 2) {
          const k = i & 1, u = (i >> 1) / half, x = -2.4 + 4.8 * u, base = eqAt(u) * 1.7 - 0.6;
          const y = base + (k ? sep : -sep) + (rnd[i] - 0.5) * 0.035, z = (rnd[(i * 7) % N] - 0.5) * 0.16;
          if (k) set(i, x, y, z, 0.36 + 0.6 * conv, 0.84 + 0.14 * conv, 1.0); else set(i, x, y, z, 0.66 + 0.3 * conv, 0.55 + 0.43 * conv, 1.0);
        } else {
          const u2 = (i - half * 2) / (N - half * 2), g = 0.2 + 0.8 * conv;
          set(i, -2.4 + 4.8 * u2, -1.45 + (1 - conv) * 0.22 * Math.sin(u2 * 40 + t * 3), (rnd[i] - 0.5) * 0.05, 0.3 * g, 1.0 * g, 0.6 * g);
        }
      }
    },
    redpen() {
      S.marks += (S.marksT - S.marks) * 0.06;
      const m = S.marks, nText = Math.floor(N * 0.66), nBorder = Math.floor(N * 0.1), nBox = Math.floor(N * 0.14), lines = 11, top = 1.25, step = 0.24;
      for (let i = 0; i < N; i++) {
        if (i < nText) {
          const li = i % lines, u = Math.floor(i / lines) / (nText / lines);
          let x = -0.9 + u * 1.8; if (Math.sin(x * 23 + li * 7.3) > 0.82) x += 0.06; if (li === lines - 1 && u > 0.55) x = -0.9 + (u - 0.55) * 0.5;
          set(i, x, top - li * step + (rnd[i] - 0.5) * 0.045 + 0.018 * Math.sin(x * 40), (rnd[i] - 0.5) * 0.04, 0.72, 0.78, 1.0);
        } else if (i < nText + nBorder) {
          const j = (i - nText) / nBorder * 4; let sx: number, sy: number;
          if (j < 1) { sx = -1.1 + j * 2.2; sy = 1.5; } else if (j < 2) { sx = 1.1; sy = 1.5 - (j - 1) * 3.0; } else if (j < 3) { sx = 1.1 - (j - 2) * 2.2; sy = -1.5; } else { sx = -1.1; sy = -1.5 + (j - 3) * 3.0; }
          set(i, sx, sy, 0, 0.3, 0.32, 0.4);
        } else {
          let px: number, py: number;
          if (i < nText + nBorder + nBox) {
            const q = (i - nText - nBorder) / nBox * 4, bx0 = 0.08, bx1 = 0.62, by0 = top - 4 * step - 0.11, by1 = top - 4 * step + 0.11;
            if (q < 1) { px = bx0 + q * (bx1 - bx0); py = by1; } else if (q < 2) { px = bx1; py = by1 - (q - 1) * (by1 - by0); } else if (q < 3) { px = bx1 - (q - 2) * (bx1 - bx0); py = by0; } else { px = bx0; py = by0 + (q - 3) * (by1 - by0); }
          } else {
            const v = (i - nText - nBorder - nBox) / (N - nText - nBorder - nBox); px = -0.75 + v * 0.75; py = top - 8 * step - 0.13 + 0.04 * Math.sin(v * 50);
          }
          const ax = (rnd[i] - 0.5) * 7, ay = (rnd[(i * 3) % N] - 0.5) * 5, az = (rnd[(i * 5) % N] - 0.5) * 4;
          set(i, px * m + ax * (1 - m), py * m + ay * (1 - m), 0.05 * m + az * (1 - m), 1.0 * m + 0.05, 0.2 * m + 0.02, 0.27 * m + 0.03);
        }
      }
    },
    lob(t) {
      const o = OB[S.op], tl = [o.map / 471.2, o.heap / 471.2, o.ours / 471.2], ns = [o.map, o.heap, o.ours], fin = [0, 0, 0];
      if (S.race) {
        const el = (performance.now() - S.race.t0) / 1000, names = ['std::map', 'heap', 'ours'], txt: string[] = [];
        let done = 0;
        for (let q = 0; q < 3; q++) {
          const realMs = ns[q] * 100000 / 1e6, pr = Math.min(1, el / (realMs * 0.1));
          S.len[q] = pr; fin[q] = pr >= 1 ? 1 : 0; if (pr >= 1) done++;
          txt.push(names[q] + (pr >= 1 ? ' ✓ ' + realMs.toFixed(2) + ' ms' : ' …'));
        }
        if ((raceTick++ & 1) === 0 && S.onRace)
          S.onRace(`100,000 ${S.op}s · clock ${Math.min(el * 10, Math.max(...ns) * 0.1).toFixed(2)} ms · ${txt.join(' · ')} · slowed 100×`);
        if (done === 3 && el > Math.max(...ns) * 0.01 + 1.8) { S.race = null; S.onRace?.(null); }
      } else for (let k = 0; k < 3; k++) S.len[k] += (tl[k] - S.len[k]) * 0.07;
      const rows = [0.85, 0.0, -0.85], cs = [[0.55, 0.58, 0.66], [0.42, 0.44, 0.52], [0.3, 1.0, 0.55]], x0 = -1.6, full = 3.8;
      for (let i = 0; i < N; i++) {
        const k2 = i % 3, len = S.len[k2] * full, flow = (rnd[i] + t * (k2 === 2 && !S.race ? 0.5 : 0.08)) % 1, edge = Math.min(1, (1 - flow) * 6);
        const b = (k2 === 2 ? 1 : 0.55 + 0.45 * edge) * (fin[k2] ? 1.25 : 1), c = cs[k2];
        set(i, x0 + flow * len, rows[k2] + (rnd[(i * 13) % N] - 0.5) * 0.3, (rnd[(i * 29) % N] - 0.5) * 0.3, c[0] * b, c[1] * b, c[2] * b);
      }
    },
    sift(t) {
      const mode = S.sift, aOn = mode !== 'se' ? 1 : 0.1, bOn = mode !== 'kw' ? 1 : 0.1, fOn = mode === 'fused' ? 1 : 0.12;
      for (let i = 0; i < N; i++) {
        const s = (rnd[i] + t * 0.07) % 1, side = i & 1, spread = rnd[(i * 17) % N] - 0.5, z = (rnd[(i * 31) % N] - 0.5) * 0.4;
        if (s < 0.5) {
          const u = s / 0.5, sy = side ? 1.2 : -1.2, on = side ? aOn : bOn, x = -2.6 + u * 2.4, y = sy * (1 - u * u * (3 - 2 * u)) + spread * 0.32 * (1 - u * 0.6);
          if (side) set(i, x, y, z, 0.66 * on, 0.55 * on, 1.0 * on); else set(i, x, y, z, 0.36 * on, 0.7 * on, 1.0 * on);
        } else {
          const u3 = (s - 0.5) / 0.5, w = (0.75 + 0.25 * u3) * fOn, x = -0.2 + u3 * 2.8, y = spread * 0.16 * (1 - u3 * 0.5) + 0.04 * Math.sin(x * 6 - t * 4);
          set(i, x, y, z, w, 0.97 * w, w);
        }
      }
    },
    sphere(t) {
      for (let i = 0; i < N; i++) {
        const k = i + 0.5, ph = Math.acos(1 - 2 * k / N), th = Math.PI * (1 + Math.sqrt(5)) * k + t * 0.12, r = 1.7 + 0.12 * Math.sin(ph * 6 + t * 1.2) * Math.cos(th * 3);
        const x = r * Math.sin(ph) * Math.cos(th), y = r * Math.cos(ph), z = r * Math.sin(ph) * Math.sin(th), h = (y / r + 1) / 2;
        set(i, x, y, z, 0.3 + 0.3 * h, 0.45 + 0.1 * h, 0.85);
      }
    },
    burst(t) {
      for (let i = 0; i < N; i++) {
        const a = rnd[i] * 6.283 + t * 0.05 * (1 + rnd[(i * 3) % N]), arm = (i % 3) * 2.094, rr = Math.pow(rnd[(i * 7) % N], 0.6) * 3.2, ang = a * 0.15 + arm + rr * 1.2, h = 1 - rr / 3.2;
        set(i, Math.cos(ang) * rr, (rnd[(i * 11) % N] - 0.5) * 0.25 * (1 + rr * 0.2), Math.sin(ang) * rr, 0.5 + 0.4 * h, 0.42 + 0.3 * h, 0.95);
      }
    },
  };

  const V: Record<Shape, View> = {
    depth: { c: [0, 2.5, 6.6], l: [0, -0.4, 0], gx: 0, gy: 0, ry: 0, s: 1 },
    quant: { c: [0, 0.2, 6.6], l: [0, 0, 0], gx: 1.55, gy: 0.15, ry: -0.1, s: 0.78 },
    redpen: { c: [0, 0.2, 6.4], l: [0, 0, 0], gx: 1.95, gy: 0.1, ry: -0.18, s: 0.95 },
    lob: { c: [0, 0.25, 6.6], l: [0, 0, 0], gx: 1.45, gy: 0.1, ry: -0.12, s: 0.85 },
    sift: { c: [0, 0.3, 6.6], l: [0, 0, 0], gx: 1.6, gy: 0.1, ry: -0.1, s: 0.82 },
    sphere: { c: [0, 0.4, 6.8], l: [0, 0, 0], gx: 2.4, gy: 0, ry: 0, s: 1 },
    burst: { c: [0, 3.4, 6.2], l: [0, 0, 0], gx: 1.8, gy: -0.2, ry: 0, s: 1 },
  };
  if (small) (Object.keys(V) as Shape[]).forEach((k) => { const v = V[k]; if (k !== 'depth') { v.gx = 0; v.gy = 1.25; } v.c = [v.c[0], v.c[1], v.c[2] + 2.4]; });

  const look = new THREE.Vector3(0, -0.4, 0), ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.6), hit = new THREE.Vector3();
  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
  addEventListener('resize', resize); resize();
  let nmx = 0, nmy = 0;
  const onMove = (e: PointerEvent) => { nmx = e.clientX / innerWidth * 2 - 1; nmy = e.clientY / innerHeight * 2 - 1; };
  addEventListener('pointermove', onMove);

  const t0 = performance.now();
  let raf = 0, dim = 1;
  const step = (t: number) => {
    const shape = S.shape;
    if (shape === 'depth') {
      ray.setFromCamera(new THREE.Vector2(nmx, -nmy), camera);
      if (ray.ray.intersectPlane(plane, hit)) { ripX += (hit.x - ripX) * 0.12; ripZ += (hit.z - ripZ) * 0.12; }
    }
    shapes[shape](t);
    for (let i = 0, j = 0; i < N; i++, j += 3) {
      const s = reduce ? 1 : spd[i];
      pos[j] += (tgt[j] - pos[j]) * s; pos[j + 1] += (tgt[j + 1] - pos[j + 1]) * s; pos[j + 2] += (tgt[j + 2] - pos[j + 2]) * s;
      col[j] += (tcol[j] - col[j]) * 0.07; col[j + 1] += (tcol[j + 1] - col[j + 1]) * 0.07; col[j + 2] += (tcol[j + 2] - col[j + 2]) * 0.07;
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.aColor.needsUpdate = true;
    const v = V[shape];
    camera.position.x += (v.c[0] + nmx * 0.4 - camera.position.x) * 0.04;
    camera.position.y += (v.c[1] - nmy * 0.28 - camera.position.y) * 0.04;
    camera.position.z += (v.c[2] - camera.position.z) * 0.04;
    look.x += (v.l[0] - look.x) * 0.05; look.y += (v.l[1] - look.y) * 0.05; look.z += (v.l[2] - look.z) * 0.05;
    camera.lookAt(look);
    group.position.x += (v.gx - group.position.x) * 0.05; group.position.y += (v.gy - group.position.y) * 0.05;
    const sc = group.scale.x + (v.s - group.scale.x) * 0.05; group.scale.set(sc, sc, sc);
    const spin = shape === 'sphere' || shape === 'burst';
    group.rotation.y = spin ? t * 0.08 : group.rotation.y + (v.ry - group.rotation.y) * 0.05;
    dim += (S.dim - dim) * 0.06; mat.uniforms.uDim.value = dim;
    mat.uniforms.uTime.value = t;
    renderer.render(scene3, camera);
  };
  const loop = (now: number) => { if (!document.hidden) step((now - t0) / 1000); raf = requestAnimationFrame(loop); };
  if (reduce) { S.conv = 1; step(0); } else raf = requestAnimationFrame(loop);
  let lastShape = S.shape;
  const reducedTick = reduce ? setInterval(() => { if (S.shape !== lastShape) { lastShape = S.shape; step(0); } }, 200) : 0;

  return () => {
    cancelAnimationFrame(raf); if (reducedTick) clearInterval(reducedTick);
    removeEventListener('resize', resize); removeEventListener('pointermove', onMove);
    geo.dispose(); mat.dispose(); renderer.dispose();
  };
}
