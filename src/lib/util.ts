import { getCollection } from 'astro:content';

/** Published projects: featured first, then by `order`, then title. */
export async function getProjects() {
  const all = await getCollection('projects', ({ data }) => !data.draft);
  return all.sort(
    (a, b) =>
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
