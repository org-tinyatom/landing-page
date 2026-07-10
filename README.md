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

## Deploy

Upload the folder to any static host. No dependencies.
