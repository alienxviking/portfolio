// Contribution calendar for the Activity section.
// Read from GitHub's public calendar page (refreshed every 12 hours on the server);
// falls back to a snapshot committed with the site if GitHub can't be reached.
import snapshot from './contribs-snapshot.json';

export type Day = { date: string; count: number; level: number };
export type Calendar = { days: Day[]; total: number; source: 'live' | 'snapshot' };

const USER = 'alienxviking';

export function parseCalendar(html: string): Day[] {
  const cells = new Map<string, { date: string; level: number }>();
  for (const tag of html.match(/<td\b[^>]*data-date="[^"]+"[^>]*>/g) ?? []) {
    const date = /data-date="([^"]+)"/.exec(tag)?.[1], id = /\bid="([^"]+)"/.exec(tag)?.[1], level = /data-level="(\d)"/.exec(tag)?.[1];
    if (date && id && level) cells.set(id, { date, level: +level });
  }
  const counts = new Map<string, number>();
  for (const m of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)/g)) {
    const t = m[2].trim(), n = /^(\d[\d,]*)\s+contribution/.exec(t);
    counts.set(m[1], t.startsWith('No ') ? 0 : n ? +n[1].replace(/,/g, '') : 0);
  }
  return [...cells.entries()].map(([id, c]) => ({ date: c.date, level: c.level, count: counts.get(id) ?? (c.level ? 1 : 0) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getCalendar(): Promise<Calendar> {
  try {
    const res = await fetch(`https://github.com/users/${USER}/contributions`, { next: { revalidate: 43200 }, headers: { 'user-agent': 'snehangshu-portfolio' } });
    if (res.ok) {
      const days = parseCalendar(await res.text());
      if (days.length >= 300) return { days, total: days.reduce((s, d) => s + d.count, 0), source: 'live' };
    }
  } catch { /* fall through to the snapshot */ }
  const days = snapshot as Day[];
  return { days, total: days.reduce((s, d) => s + d.count, 0), source: 'snapshot' };
}
