# TinyAtom Landing Page

Static marketing page for TinyAtom, served at **https://tinyatom.app/**. No build step required.

## What TinyAtom is

TinyAtom is a free desktop app for building and running small internal tools without servers, code repositories, or cloud hosting. Tools run on the user's computer and their data stays there.

The pitch: go from a job you need done to working software on your computer, without setting up a software project. No server to run, no repo to maintain for every small tool, no cloud account for the tool runtime, and no monthly SaaS bill for a five-person internal tool.

You describe the job, build the tool with a coding assistant (Claude, Codex, Cursor, Gemini, or a local shell) inside TinyAtom Studio, review what files and computer features the tool is asking for, then install it on one machine or share it through a private company list.

## Who it is for

**Businesses** that need specific internal software too small to justify a custom project: intake forms, onboarding, inventory, field reports, approvals, and other repeated internal jobs. Teams can build tools around how they actually work, install them on employee computers, pull from the community marketplace, or keep private tools on a company list.

**Individuals** who want free local tools for personal workflows (research, applications, side projects) without adding another subscription.

TinyAtom is *not* a hosted SaaS admin panel builder, and it does not ask you to deploy infrastructure.

Distribution runs through a public marketplace for community tools plus private company lists for internal ones. Submitted tools are reviewed for security problems and bugs before publication, as a best effort rather than a guarantee, and tools promoting gambling or adult content are not allowed.

The product is free for everyone. The macOS build is available now; Windows and Linux are in progress.

> When editing copy, treat `llms.txt` as the source of truth for product claims and keep `index.html`, `privacy.html`, `terms.html`, and `llms.txt` consistent with each other.

## Preview

```bash
python3 -m http.server 8080
```

Open http://localhost:8080

## Design

- **Palette**: TinyAtom VS Code-inspired surfaces with brand blue `#0078D4`
- **Type**: Sora for UI copy, IBM Plex Mono for labels/kickers
- **Theme**: Defaults to **System** via `prefers-color-scheme`; FAB cycles system → light → dark
- **Motion**: Scroll reveals with `prefers-reduced-motion` support

## SEO / AEO / agent readiness

Files that help search engines, social apps, and LLM/agent crawlers:

| File | Purpose |
|------|---------|
| `index.html` | Title, meta description, canonical, Open Graph, Twitter cards, JSON-LD |
| `assets/og-image.png` | Social share thumbnail (1200×630) |
| `robots.txt` | Allows major search + AI crawlers; points to sitemap |
| `sitemap.xml` | URL inventory for crawlers |
| `llms.txt` | Plain-language product summary for agents and answer engines |

Canonical site URL used in meta tags: **https://tinyatom.app/**  
If the production host differs, update that host in `index.html`, `robots.txt`, `sitemap.xml`, and `llms.txt`.

### After deploy

1. Confirm `https://your-domain/assets/og-image.png` loads publicly
2. Test share previews: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/), [Twitter Card Validator](https://cards-dev.twitter.com/validator), LinkedIn Post Inspector
3. Submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools

## Deploy

Deployed via GitHub Pages from `main`. Pushing to `main` publishes the site; there are no dependencies and no build step.

The custom domain is configured by the `CNAME` file at the repo root (`tinyatom.app`). DNS lives at Squarespace: four `A` records and four `AAAA` records on the apex pointing at GitHub Pages, plus a `www` CNAME to `org-tinyatom.github.io`. Note that re-saving the custom domain in the Pages settings UI rewrites `CNAME` and commits to `main`, so pull before your next edit.
