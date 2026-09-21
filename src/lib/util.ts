import { getCollection } from 'astro:content';
import orderData from '../data/order.json';

/** Project id from whatever Pages CMS stored ("src/content/projects/cyberbid.md", "cyberbid.md" or "cyberbid"). */
const idOf = (v: unknown) => String(v ?? '').split('/').pop()!.replace(/\.(md|mdx)$/i, '').trim();
const dragged: string[] = (Array.isArray((orderData as any)?.projects) ? (orderData as any).projects : []).map(idOf).filter(Boolean);

/**
 * Published projects in the order set by dragging in Pages CMS → "Project order".
 * Projects not in that list (e.g. just added) come after, featured first, then by `order`, then title.
 */
export async function getProjects() {
  const all = await getCollection('projects', ({ data }) => !data.draft);
  const pos = (id: string) => { const i = dragged.indexOf(id); return i === -1 ? Infinity : i; };
  return all.sort(
    (a, b) =>
      (pos(a.id) === pos(b.id) ? 0 : pos(a.id) < pos(b.id) ? -1 : 1) ||
      Number(b.data.featured) - Number(a.data.featured) ||
      a.data.order - b.data.order ||
      a.data.title.localeCompare(b.data.title),
  );
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Escape text, then turn *word* into <em>word</em> (the one accented word in a headline). */
export const emph = (s: string) => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');

/** Plain paragraphs from text separated by blank lines. */
export const paras = (s: string) => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "2021-07-01" → "Jul 2021" (day is ignored). */
const monthYear = (d?: string) => {
  const m = String(d ?? '').match(/^(\d{4})-(\d{1,2})/);
  return m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : '';
};
/**
 * Date range from the calendar fields in Pages CMS: "Jul 2021 – Feb 2023", "Aug 2024 – Present".
 * Falls back to an old free-text `period` if no dates are set.
 */
export function dateRange(r: { start?: string; end?: string; current?: boolean; period?: string }) {
  const s = monthYear(r.start);
  const e = r.current ? 'Present' : monthYear(r.end);
  if (s && e) return s === e ? s : `${s} – ${e}`;
  return s || e || r.period || '';
}
