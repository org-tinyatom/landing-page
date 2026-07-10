# TinyAtom Landing Page

Static marketing page for TinyAtom. No build step required.

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

Upload the folder to any static host. No dependencies.
