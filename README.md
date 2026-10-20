# snehangshu-roy-portfolio

My portfolio. A particle field sits behind the whole site and changes shape with what you're reading: an order-book depth landscape on the home page, then one shape per project (two backtest curves converging, a marked answer page, order-book bars at their measured latencies, two search rankings fusing into one).

Live: https://snehangshu-roy-portfolio.vercel.app

## Stack

- Next.js 15 (App Router, static export of every page)
- three.js for the particle field (`lib/engine.ts`): ~24K points eased toward per-shape targets every frame
- motion for UI animation: shared-layout pills, springs, scroll-linked text
- Lenis for smooth scrolling
- Geist / Geist Mono

## Bits worth looking at

- `lib/grains.ts`: the hero name is drawn as normal text, then split into grains wherever the pointer touches it; the grains scatter and spring back into the exact pixels.
- `components/WorkStage.tsx`: a pinned, scroll-driven stage. Each project has a live control (replay the quant convergence, run the order-book race, switch sift between keyword/semantic/fused).
- `app/work/[slug]`: case studies. The particle field persists across navigation, so it morphs into the project's shape instead of reloading.

## Run it

```bash
npm install
npm run dev
```

Every number on the site comes from a test, a benchmark or a recorded run in the linked repos.
