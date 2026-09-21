# Vighnesh Iyer — portfolio

Astro static site, cyber-neon dark theme. **Hosting:** GitHub Pages to test it (free, built into your repo); Cloudflare later if you want (free, faster, supports the old-link redirects). **Editing:** Pages CMS — log in with GitHub at app.pagescms.org, no code needed. **Contact form:** Web3Forms (free, 250 messages/month, delivered to your email).

| Page | URL | Edit in Pages CMS under |
| --- | --- | --- |
| Home | `/` | Home & site-wide (+ Projects) |
| About | `/about/` | About page |
| Skills | `/skills/` | Skills page |
| Experience | `/experience/` | Experience page |
| Education | `/education/` | Education page |
| Portfolio | `/portfolio/` (filter by discipline) | Projects |
| Case studies | `/work/<project>/` | Projects |
| Contact | `/contact/` (form + FAQ) | Contact page |

Projects are Markdown files in `src/content/projects/`, page text is JSON in `src/data/`, images live in `public/uploads/`. `public/_redirects` is ready for when you move your domain over: every old `/pages/...` URL (about, case-study_01…, 3d_gallery_01…) will redirect to its new page.

---

## One-time setup (about 10 minutes)

### 1. Put the code on GitHub
1. Go to **github.com/new** → name it `vighnesh-portfolio` → **Public** → leave every box unticked → **Create repository**.
2. On the empty repo page click **uploading an existing file**, drag in everything inside this folder (not `node_modules` or `dist` if you have them) → **Commit changes**.
   *Hidden files matter:* `.github/workflows/deploy.yml`, `.pages.yml` and `.gitignore` must be included. On macOS press **Cmd + Shift + .** in Finder to show them; on Windows, View → Show → Hidden items. After committing, check the repo file list shows `.github` and `.pages.yml`.

### 2. Test it on GitHub Pages
1. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Open the **Actions** tab. The "Deploy to GitHub Pages" run starts on its own (if it doesn't, click it → **Run workflow**). It takes about a minute.
3. Your site is live at **https://vighneshiyer14.github.io/vighnesh-portfolio/**.

From now on every change on GitHub — including every save in Pages CMS — republishes the site automatically.

*If `.github` didn't upload:* Actions tab → **set up a workflow yourself** → name it `deploy.yml` → paste the contents of `.github/workflows/deploy.yml` from this folder → **Commit**.

### 3. Turn on the CMS (Pages CMS)
1. Go to **app.pagescms.org** → **Sign in with GitHub**.
2. When asked, install the Pages CMS GitHub app and give it access to `vighnesh-portfolio`.
3. Open the repo. You'll see **Projects**, **Home & site-wide**, **About page**, **Skills page**, **Experience page**, **Education page**, **Contact page** and **Media** in the sidebar.

### 4. Turn on the contact form (Web3Forms)
1. Go to **web3forms.com**, enter the email where you want messages → you get an **access key** by email.
2. In Pages CMS → **Home & site-wide** → paste it into **Contact form key** → **Save**.
3. After the site republishes the Contact page shows the form. Until a key is set, it shows an "Email me" button instead, so nothing is ever broken.

### 5. Later (optional): Cloudflare + your own domain
When you're done testing, the same repo can also deploy to Cloudflare (free, faster, and it applies the old `/pages/...` redirects):
1. **dash.cloudflare.com → Workers & Pages → Create application → Import a repository**, pick `vighnesh-portfolio`, keep the name `vighnesh-portfolio` (matches `wrangler.jsonc`), defaults are fine → **Save and Deploy**.
2. To use `vighneshiyer-profile.in`: **Add a domain** in Cloudflare, switch your registrar's nameservers to Cloudflare's, then Worker → **Settings → Domains & Routes → Add → Custom domain**, and add a build variable `SITE_URL` = `https://vighneshiyer-profile.in`.

---

## Adding a new project
1. Pages CMS → **Projects → Add an entry**.
2. Pick the **Discipline** (UI/UX Design, 3D Modeling or Graphic Design — drives the Portfolio filter), then title, one-sentence summary, category, **cover image** (16:10, e.g. 1600×1000), tags, and write the case study (Context → Problem → Process → Outcome). Add more screens under **Gallery**.
3. **Order**: lower = earlier. **Featured**: the big glowing card on Home. **Draft**: hidden from the site.
4. **Save.** The site republishes in about a minute (watch it in the repo's Actions tab).

Everything else — intro, "Open to work" badge, CV, stats, skills and their levels, jobs, education, FAQ — is under the page entries in the sidebar. In any headline, wrap words in `*stars*` to make them neon purple.

## Working on your computer (optional)
```bash
npm install
npm run dev        # http://localhost:4321
npm run preview    # build + run on Cloudflare's local runtime
```

## Things to fill in
- Replace the placeholder cover images with real screens/renders (upload in Pages CMS → Projects → Cover).
- Case studies for the newer projects are outlines — write them in Pages CMS.
- Upload a CV PDF (Home & site-wide → CV) and add dates for the Baron Tech Labs role (Experience page).

## Design system
Colours, type and components mirror the "Vighnesh Iyer" design system artifact. Tokens are at the top of `src/styles/global.css`.
