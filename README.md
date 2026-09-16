# Tomasz Knura — portfolio

A static portfolio built with [Astro](https://astro.build): steel-and-cobalt palette, paper textures, a force-directed graph, a canvas 3D knot, a pointer-driven poster, and playful button interactions. No UI framework, no client-side runtime beyond the small TypeScript modules that power each experiment.

## Run locally

Requires Node 22+.

```sh
npm install
npm run dev
```

Open http://localhost:4321. Other scripts:

| Script            | What it does                                        |
| ----------------- | --------------------------------------------------- |
| `npm run build`   | Production build to `dist/`                        |
| `npm run preview` | Serve the production build locally                  |
| `npm run check`   | Type-check `.astro` and `.ts` files with `astro check` |

## Project structure

```
src/
  pages/index.astro          The single page; composes the sections in order.
  layouts/BaseLayout.astro   <head>, metadata, fonts, skip link, grain overlay.
  components/
    Header.astro, Ticker.astro, SectionLabel.astro, ContactDialog.astro
    sections/                One component per page section (Hero, Work, Playground, About, BugReport, Contact).
    experiments/             The interactive studies (ExplorerGraph, OverviewDashboard, TypeStudy, RhythmStudy, OrbitStudy, PointerStudy).
  scripts/                   Client-side TypeScript, one module per interaction. Each component imports its own module in a <script> tag.
    graph-physics.ts         Standalone spring/repulsion/collision solver (custom, not D3).
    explorer-graph.ts        SVG rendering, selection, dragging, zoom, fit/reset, Explorer/Overview tabs.
    orbit-knot.ts            Canvas-rendered, painter-sorted 3D tube mesh.
    pointer-poster.ts        Pointer-following reveal and tilt.
    playground.ts, contact-dialog.ts, bug-button.ts, ...
  data/
    site.ts                  Title, description, navigation, font URL.
    graph.ts                 Graph nodes, links, palette, legend, and icons.
  styles/global.css          Layout, color tokens, typography, textures and animations.
public/
  favicon.svg
  textures/                  Paper grain and ink tile assets.
```

Astro bundles each component's `<script>` at build time, so scripts stay colocated with the markup they drive while shared logic lives in `src/scripts`.

## Editing common parts

### Content and branding
Section copy lives in the matching component under `src/components/sections/`. Site-wide metadata and the navigation list are in `src/data/site.ts`.

### Contact
The contact dialog says that contact details are coming soon. There is no backend, email delivery, or stored form submission. Update `ContactDialog.astro` and the copy in `src/scripts/contact-dialog.ts` before a public launch.

### Graph
Change the nodes, links, `palette`, `legend`, and `icons` in `src/data/graph.ts`. Every link must reference an existing node ID. Physics constants (link lengths, repulsion, damping, collision spacing) are in `src/scripts/graph-physics.ts`. The simulation sleeps after settling and pauses when offscreen or when the tab is hidden. Reduced-motion users get a settled layout without continuous movement.

### Styles
`src/styles/global.css` is a single global stylesheet. Main tokens are `--paper`, `--ink`, `--accent`, and `--line`. It contains successive design overrides near the end of the file, so later rules take precedence. The stylesheet is imported once in `BaseLayout.astro`.

### Layout
The page is edge-to-edge through 1600 CSS pixels. Above 1600px, the framed sheet appears with a maximum width of 1440px. Change the final `.page-frame` media query to adjust this threshold.

## Hosting

`npm run build` writes a fully static site to `dist/`. Upload its contents to any static host, or point Netlify, Vercel, Cloudflare Pages, or GitHub Pages at this repo with `npm run build` as the build command and `dist` as the output directory. Set `site` in `astro.config.mjs` to the final domain.

Fonts (Barlow Condensed, DM Sans, IBM Plex Mono) load from Google Fonts via a `<link>` in the layout. Without internet access, system-font fallbacks are used.

## Interaction/accessibility notes

The site supports keyboard controls and `prefers-reduced-motion`. Graph nodes can be selected with Enter/Space and moved with arrow keys. The 3D canvas supports arrow-key rotation. The bug button can be activated immediately from the keyboard. The contact panel uses the native modal dialog.
