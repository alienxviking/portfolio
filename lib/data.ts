import type { Shape } from './scene';

export const SITE = {
  name: 'Snehangshu Roy',
  role: 'Systems + AI engineer',
  city: 'Bengaluru',
  email: 'snehangshu.roy.mail@gmail.com',
  github: 'https://github.com/alienxviking',
  linkedin: 'https://www.linkedin.com/in/snehangshu-roy/',
  x: 'https://x.com/SnehangshuRoy15',
  url: 'https://snehangshu-roy-portfolio.vercel.app',
  resume: '/resume/Snehangshu-Roy-Resume.pdf',
};

export type Section = { h: string; p?: string[]; list?: string[] };
export type Featured = {
  slug: string;
  shape: Shape;
  n: string;
  acc: string;
  tag: string;
  title: string;
  th: string;
  bd: string;
  stats: [string, string][];
  links: [string, string][];
  cap: string;
  meta: [string, string][];
  sections: Section[];
  figure: 'quant' | 'redpen' | 'lob' | 'sift';
};

export const FEATURED: Featured[] = [
  {
    slug: 'quant', shape: 'quant', n: '01', acc: 'var(--cyan)', tag: 'Rust',
    title: 'quant',
    th: 'One strategy binary. Backtest, paper and live run the same code.',
    bd: "A trading platform built so a backtest can't describe a system that was never run. Only the data source and the venue change between modes. Money is fixed-point, the engine dispatches on receive time only, and every order passes a risk layer the strategy can't skip.",
    stats: [['Δ 0', 'paper vs backtest P&L, 14 live days'], ['797', 'tests, 12 crates'], ['97.9M', 'frames, none missing']],
    links: [['GitHub', 'https://github.com/alienxviking/quant']],
    cap: 'fig. 1 · paper and backtest as two particle curves. The shape is illustrative; the match is measured: 824 = 824 fills on BTCUSDT, 822 = 822 on ETHUSDT.',
    meta: [['Role', 'Sole author'], ['Stack', 'Rust, Tokio, Parquet/Arrow, Postgres, zstd'], ['Size', '12 crates · ~65K lines · 797 tests'], ['Status', 'M0–M7.5 done · M8 (live) in progress']],
    figure: 'quant',
    sections: [
      { h: 'The problem', p: [
        'Most backtests describe a system that was never run. The backtest has its own fill model, its own clock and its own idea of when data arrived, and the live system has another. Nothing checks that the two agree, so they quietly drift apart.',
        'quant is built around one rule: a strategy must not be able to tell which world it is running in. If it can, that is a bug.' ] },
      { h: 'One binary, three worlds', p: [
        'An EventSource feeds the engine and an ExecutionVenue takes its orders. Backtest is HistoricalSource (Parquet replay) with SimulatedVenue. Paper is LiveSource (the Binance WebSocket) with the same SimulatedVenue. Live swaps in LiveVenue. There is deliberately no separate paper venue: a second fill model would be a second thing that must agree forever, with no way to notice when it stopped.',
        'Every order passes a mandatory RiskLayer. It keeps its own tally instead of reading the portfolio, because a limit computed from the accounting can only be as correct as the accounting.' ] },
      { h: 'Invariants, enforced by the compiler and tests', list: [
        'Money is fixed-point i64 scaled by 1e8. Float arithmetic is denied workspace-wide by clippy.',
        'Every event carries two timestamps, and only the local receive time is ever dispatched on. Anything else is lookahead bias.',
        'Gaps are recorded events. "We were not watching" is data, not silence.',
        'Time is injected through a Clock trait. Anything that calls the wall clock directly cannot be backtested.' ] },
      { h: 'Results, milestone by milestone', list: [
        'M1: the recorder ran 7 days unattended (21–28 Aug 2026); the verifier exited 0 with every discontinuity explained by a record in the capture.',
        'M2: 70,545,345 events replayed from the Parquet tier match the raw replay event for event, with book invariants holding at every tick.',
        'M3: a moving-average crossover takes $100 to $97.53 with no fees. That is the result to want: a first strategy that looked profitable would mean the harness was lying.',
        'M4: at Binance spot\'s 10 bps a side the same week ends at $64.74. The strategy loses 2.5% on price and 33% on commission.',
        'M5: a 14-day live paper run (18 Sep – 2 Oct 2026) on BTCUSDT and ETHUSDT. Paper P&L reproduced a backtest over the same window exactly, to the satoshi, across 97,937,822 captured frames with none missing, including a 12-hour Wi-Fi outage recorded as a gap.',
        'M6: under test, an oversized order never reaches the venue and a runaway strategy gets exactly its order limit out.' ] },
      { h: 'Now', p: ['M8: live trading with tiny capital. Done means our record and the exchange\'s agree exactly, every order\'s outcome matches what the model predicted, and its price error stays inside a bound registered beforehand.'] },
    ],
  },
  {
    slug: 'redpen', shape: 'redpen', n: '02', acc: 'var(--coral)', tag: 'TypeScript · LLMs',
    title: 'RedPen',
    th: "Trust the model's judgement, not its arithmetic.",
    bd: 'Marks answer papers against a rubric. Every mark is anchored to a verbatim quote from the student, mapped to a character span and then to a box on the page. Code clamps each mark to its rubric row and reconciles the total; uncertain results get flagged for review.',
    stats: [['102', 'offline tests'], ['23', 'planted errors as ground truth'], ['4', 'LLM backends, one interface']],
    links: [['GitHub', 'https://github.com/alienxviking/redpen']],
    cap: 'fig. 2 · an answer page, with the mistake boxed where it was written',
    meta: [['Role', 'Sole author · 36-hour take-home'], ['Stack', 'TypeScript, Node, React, pdf.js, pdf-lib, Vitest'], ['Models', 'Claude, Gemini, Groq / OpenAI-compatible, offline'], ['Tests', '102, no network, no API key']],
    figure: 'redpen',
    sections: [
      { h: 'The problem', p: ['AI grading is easy to demo and hard to trust. Models award more marks than a question allows, totals that do not add up, and confident feedback about sentences the student never wrote. A teacher needs to see what was written, where the problem is and exactly how many marks were lost.'] },
      { h: 'How a paper gets marked', list: [
        'Extract: the PDF becomes text with a bounding box for every run of characters, plus offsets into the flat text. Those offsets are the join key for everything after.',
        'Grade: the rubric, the model answer, the text and the PDF itself go to the model, which returns marks, evidence quotes and annotations against a strict JSON schema.',
        'Reconcile: the model\'s judgements are kept; its arithmetic is not. Totals are recomputed, marks are clamped, skipped rubric points are filled in, and every adjustment is recorded.',
        'Anchor: each quote is located in the paper (exactly, then by fuzzy word-window search, then by a distinctive-word fallback) and turned into per-line rectangles.',
        'Annotate: boxes are drawn over a copy of the paper with the correction in the margin. Annotations stay editable without re-marking.' ] },
      { h: 'The guarantees', list: [
        'A mark never exceeds its rubric maximum and is never negative.',
        'Totals always equal the sum of their parts. This is asserted on the way out, and a breach throws instead of returning a wrong number.',
        'Marks awarded without a quote raise a flag. Quotes that cannot be located lower confidence instead of disappearing.',
        'The uploaded original is stored byte for byte and only ever read.' ] },
      { h: 'When things go wrong', p: ['A blank paper short-circuits before any model call. A model that is down, rate-limited or slow falls back to a deterministic offline grader and the result is labelled degraded. Malformed output gets a tolerant parse, one repair round-trip, then the offline grader. On Groq, which cannot see images, the two diagram questions are flagged for human review instead of guessed at.'] },
      { h: 'Proof', p: ['The test answer paper is generated from code, so it and its error key can never drift apart. It contains 23 planted mistakes with an intended mark of 6 / 15, and the suite asserts that exact breakdown: a regression shows up as a failing test, not a plausible-looking wrong number.'] },
    ],
  },
  {
    slug: 'order-book', shape: 'lob', n: '03', acc: 'var(--lime)', tag: 'C++17 · perf',
    title: 'Order book',
    th: 'Three designs, one benchmark, and counters to explain the gap.',
    bd: 'A std::map book, a lazy-deletion heap, and our own flat price array with a bitmap and an open-addressing hash table, each checked against a brute-force reference. perf explains why the fastest wins. Built with Saniya Patil.',
    stats: [['38.3 ns', 'median cancel'], ['3.8×', 'faster than std::map overall'], ['~5×', 'fewer L1 misses']],
    links: [['GitHub', 'https://github.com/alienxviking/limit-order-book']],
    cap: 'fig. 3 · bar length to scale with the measured median ns per operation',
    meta: [['Team', 'Snehangshu Roy, Saniya Patil'], ['Stack', 'C++17, perf, Docker'], ['Workload', '1M operations, medians of 5 runs'], ['Checked', 'every op against a brute-force book']],
    figure: 'lob',
    sections: [
      { h: 'Three books', list: [
        'A: std::map for price levels plus std::unordered_map for orders. About 100 lines of standard containers.',
        'B: a std::priority_queue per side with lazy deletion, and a std::map of orders, so cancels use a tree lookup instead of a hash.',
        'C, ours: the whole 10,001-tick price band as one flat array (80 KB), a bitmap scanned 64 levels at a time with clz/ctz to find the next best price, and our own open-addressing order table with Fibonacci hashing, linear probing and backward-shift deletion.' ] },
      { h: 'Why C wins', p: [
        'Every operation in C does a small, fixed amount of work: one probe, one array write and, at worst, a 79-word bitmap scan. A and B depend on tree depth, cache state and malloc.',
        'The counters show it. C retires 1.18 instructions per cycle against 0.80 for A, misses L1 about 5× less often, and allocates nothing per operation. B\'s cancel is slowest because walking its tree is a chain of dependent cache misses: the CPU only learns where the next node is after loading the current one.' ] },
      { h: 'What we would try next', list: [
        'Take integer ticks in the API: llround alone is 2.0% of C\'s samples.',
        'Allocate the order table once at startup and pre-touch it, perhaps with huge pages.',
        'Prefetch the hash slot as soon as the id is known.',
        'Measure p99 and max latency, not only medians, which hide C\'s one spike: the table resize.' ] },
    ],
  },
  {
    slug: 'sift', shape: 'sift', n: '04', acc: 'var(--violet)', tag: 'Python · pgvector',
    title: 'sift',
    th: 'Keyword and semantic search, fused into one ranking.',
    bd: 'Upload PDFs, images or Word files. Celery workers extract text, fall back to OCR for scans and compute embeddings locally. Search runs Postgres full-text and pgvector side by side and merges them with Reciprocal Rank Fusion.',
    stats: [['RRF', 'Σ 1 / (60 + rank)'], ['0', 'paid APIs, local ONNX'], ['Live', 'status over WebSockets']],
    links: [['Live demo', 'https://sift-docprocess.vercel.app/'], ['GitHub', 'https://github.com/alienxviking/sift']],
    cap: 'fig. 4 · two rankings flowing into one',
    meta: [['Role', 'Sole author'], ['Stack', 'FastAPI, Celery, Redis, Postgres + pgvector, Next.js'], ['Embeddings', 'fastembed, bge-small-en-v1.5, local ONNX'], ['Storage', 'S3-compatible (MinIO / R2)']],
    figure: 'sift',
    sections: [
      { h: 'The pipeline', p: ['An upload is stored in S3-compatible storage and recorded as a pending document, then queued. A Celery worker extracts text (PyMuPDF, with a Tesseract OCR fallback for scans), makes a thumbnail and computes embeddings, updating the status as it goes. The browser sees each step live over a WebSocket.'] },
      { h: 'Hybrid search', p: [
        'Keyword search is good at exact terms and bad at meaning; vector search is the opposite. sift runs both: Postgres full-text search and pgvector similarity over the same documents.',
        'The two ranked lists are merged with Reciprocal Rank Fusion: each document scores Σ 1 / (60 + rank) across the lists, so a result that does well in both beats one that tops only one.' ] },
      { h: 'Built to run for free', list: [
        'Embeddings run locally on ONNX (BAAI/bge-small-en-v1.5), so there is no paid API.',
        'Everything is configured by environment variables: the same code runs against Docker in development and free managed tiers in production.',
        'Multi-tenant teams with invites and roles, JWT auth and Alembic migrations.' ] },
    ],
  },
];

export const MORE = [
  { name: 'web-automation-agent', desc: 'A browser agent that works from screenshots. A vision model decides where to click and type.', tech: 'Python · Playwright · Llama 4', acc: 'var(--cyan)', live: null, code: 'https://github.com/alienxviking/web-automation-agent', shot: 'agent' },
  { name: 'search-typeahead', desc: 'Autocomplete over Wikipedia titles: a trie, three Redis nodes on consistent hashing, recency-weighted trending.', tech: 'TypeScript · Redis', acc: 'var(--violet)', live: null, code: 'https://github.com/alienxviking/search-typeahead', shot: 'typeahead' },
  { name: 'nexo', desc: 'Real-time chat with presence and seen receipts. Redis pub/sub lets socket servers scale out.', tech: 'Socket.io · Redis · Prisma', acc: 'var(--teal)', live: 'https://nexo-chatapp.vercel.app', code: 'https://github.com/alienxviking/nexo', shot: 'nexo' },
  { name: 'TripBoard on AWS', desc: 'Security-gated CI/CD to Kubernetes: SAST, secret scanning, a Trivy gate, Helm, Argo CD, Terraform for EKS.', tech: 'Terraform · EKS · Argo CD', acc: 'var(--coral)', live: null, code: 'https://github.com/alienxviking/devops-homework/tree/main/final-devops-project', shot: 'tripboard' },
  { name: 'momentum', desc: 'Habit accountability groups with streaks, a computed 0–100 score and leaderboards.', tech: 'Next.js · Supabase · PWA', acc: 'var(--lime)', live: 'https://momentum-seven-flame.vercel.app', code: 'https://github.com/alienxviking/momentum', shot: 'momentum' },
  { name: 'Mind Palace', desc: 'Notes as a 3D graph of linked ideas. Gemini tags and connects new notes.', tech: 'Three.js · Supabase · Gemini', acc: 'var(--violet)', live: 'https://mind-palace-rosy.vercel.app', code: 'https://github.com/alienxviking/Mind-Palace', shot: 'mind' },
  { name: 'TidyMind', desc: 'Desktop file manager with semantic search and duplicate detection by hash, name and size.', tech: 'Electron · React', acc: 'var(--cyan)', live: 'https://tidymind-final.vercel.app', code: 'https://github.com/alienxviking/tidymind-final', shot: 'tidy' },
  { name: 'NotebookLM clone', desc: 'Chat with your PDFs, with answers grounded through retrieval.', tech: 'Next.js · Gemini · RAG', acc: 'var(--teal)', live: 'https://note-book-llm-ten.vercel.app', code: 'https://github.com/alienxviking/NoteBook-LLM', shot: 'notebook' },
];

export const WORDS = ['trading systems', 'AI tools', 'real-time backends', 'search pipelines'];
