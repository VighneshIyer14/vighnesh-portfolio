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

/** After the build, shrink big uploads (screenshots up to ~5 MB) into web-sized WebP copies in
 *  /uploads/_opt/ and point every <img> at them. Originals stay untouched (and are still used
 *  for share previews). Only images wider than MAX_W or heavier than MIN_BYTES are converted. */
function optimizeUploads() {
  const MAX_W = 2400;
  const MIN_BYTES = 400 * 1024;
  const MAX_UPLOAD = 5 * 1024 * 1024;
  return {
    name: 'optimize-uploads',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const { default: sharp } = await import('sharp');
        const { mkdir, stat } = await import('node:fs/promises');
        const root = fileURLToPath(dir);
        const uploads = join(root, 'uploads');
        const out = join(uploads, '_opt');
        await mkdir(out, { recursive: true });
        const map = new Map();
        let before = 0, after = 0;
        const files = await readdir(uploads).catch(() => []);
        // Pages CMS can't cap upload size, so refuse to publish anything over MAX_UPLOAD here.
        // The live site keeps the previous version until the file is replaced.
        const tooBig = [];
        for (const name of files) {
          if (!/\.(png|jpe?g|webp|gif|svg|avif)$/i.test(name)) continue;
          const { size } = await stat(join(uploads, name));
          if (size > MAX_UPLOAD) tooBig.push(`  • ${name} — ${(size / 1048576).toFixed(1)} MB`);
        }
        if (tooBig.length) {
          throw new Error(
            `Image too big — the limit is ${MAX_UPLOAD / 1048576} MB per image:\n${tooBig.join('\n')}\n` +
              'Export it smaller (e.g. JPG, or 2400px wide), then in Pages CMS → Media delete this file and upload the new one.',
          );
        }
        for (const name of files) {
          if (!/\.(png|jpe?g)$/i.test(name)) continue;
          const src = join(uploads, name);
          const { size } = await stat(src);
          const { width = 0 } = await sharp(src).metadata();
          if (size < MIN_BYTES && width <= MAX_W) continue;
          const webp = name.replace(/\.[^.]+$/, '.webp');
          // WebP tops out at 16383px per side, so very tall full-page screenshots are scaled to fit
          const info = await sharp(src, { limitInputPixels: false })
            .resize({ width: MAX_W, height: 16000, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 82 })
            .toFile(join(out, webp))
            .catch((err) => { logger.warn(`kept original ${name}: ${err.message}`); return null; });
          if (!info || info.size >= size) continue;
          map.set(name, webp);
          before += size; after += info.size;
        }
        if (!map.size) return;
        logger.info(`${map.size} images: ${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB`);
        const walk = async (d) => {
          for (const e of await readdir(d, { withFileTypes: true })) {
            const p = join(d, e.name);
            if (e.isDirectory()) await walk(p);
            else if (e.name.endsWith('.html')) {
              const html = await readFile(p, 'utf8');
              const res = html.replace(/(<img\b[^>]*?\ssrc=")([^"]*?\/uploads\/)([^"/]+)"/g, (m, pre, path, file) => {
                const webp = map.get(decodeURIComponent(file));
                return webp ? `${pre}${path}_opt/${webp}"` : m;
              });
              if (res !== html) await writeFile(p, res);
            }
          }
        };
        await walk(root);
      },
    },
  };
}

export default defineConfig({ site, base, integrations: [optimizeUploads(), prefixBase()] });
