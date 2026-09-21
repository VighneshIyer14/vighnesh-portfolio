// @ts-check
import { defineConfig } from 'astro/config';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Both are optional and set automatically by the GitHub Pages workflow:
//   SITE_URL  — e.g. https://vighneshiyer14.github.io   (used for canonical / share links)
//   BASE_PATH — e.g. /vighnesh-portfolio                (when the site lives in a sub-folder)
// On Cloudflare or a custom domain, leave BASE_PATH unset.
const site = process.env.SITE_URL || undefined;
const base = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');

/** After the build, prefix root-relative links ("/about/", "/uploads/x.png") with BASE_PATH.
 *  This also covers image paths written by the CMS inside case studies. */
function prefixBase() {
  return {
    name: 'prefix-base-path',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        if (base === '/') return;
        const prefix = base.slice(0, -1); // "/vighnesh-portfolio"
        const root = fileURLToPath(dir);
        const walk = async (d) => {
          for (const e of await readdir(d, { withFileTypes: true })) {
            const p = join(d, e.name);
            if (e.isDirectory()) await walk(p);
            else if (e.name.endsWith('.html')) {
              const html = await readFile(p, 'utf8');
              const already = prefix.slice(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const re = new RegExp(`(\\s(?:href|src|action|poster)=")\\/(?!\\/)(?!${already}\\/)`, 'g');
              const out = html.replace(re, `$1${prefix}/`);
              if (out !== html) await writeFile(p, out);
            }
          }
        };
        await walk(root);
      },
    },
  };
}

export default defineConfig({ site, base, integrations: [prefixBase()] });
