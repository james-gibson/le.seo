# Agent hints

## This repository

`le.seo` is a marketing seed for a collection of seeds: a link tree with one voice and one goal,
and the `giardiniera` isotope. Live: https://james-gibson.github.io/le.seo/

## The only creative act is the sentence

Everything else is computed: the order (readiness, then name), the address (`/v/<voice>/<goal>`),
the fallback when nothing matches. The copy is where a marketing site either tells the truth about
somebody else's work or starts inventing.

- **The seed owns its copy.** Every seed publishes `/seed.json` with one pitch per voice. Quote it.
- `src/lib/tree.ts` holds a fallback `pitch` per destination; it is a holding pen, not a second
  source of truth. A carded destination must show the card's sentence.
- `src/cards/*.json` are **vendored** cards, pinned by `npm run cards:check` (runs in CI). Never
  hand-edit one; run `npm run cards`.
- `npm run copy` is the gate: length, banned superlatives, a full stop, no name-first sentences.
- `npm run doors` knocks on every destination: the front door must answer, and a root-absolute link
  must stay under the site's mount. A pitch to a 404 is the one failure a visitor cannot forgive.

## Skills

- `.opencode/skills/pitch-a-seed/` — writing copy for a destination, from its card.
- `.opencode/skills/seed-card/` — publishing a card in a seed's own repository.
- `.opencode/commands/pitch.md` — `/pitch <destination>`: one sentence, gated, committed locally.

## Commands

```bash
npm run dev          # vite
npm run build        # card, copy gate, types, tokens, vite, prerender, shells, checks, guard
npm run smoke        # render every route on the server
npm run check:tree   # the isotope's ten scenarios, executed
npm run cards        # vendor the cards the register names
npm run cards:check  # fail when a seed has moved
npm run manifest     # app title, theme colour and icons, from the card and the wall
npm run icons        # draw the PNG icons and the tab SVG from the palette
npm run isotope      # re-derive the isotope id
```

## Rules that are easy to break

- A tree never comes back empty: fall back to the voice, then to everything, and say which.
- Every `/v/<voice>/<goal>` pair is prerendered. A tree is a 200, not a query.
- A destination's URL is https; the guard refuses the rest.
- A site does not list itself. The seed publishes `/seed.json` for others to quote; its own register
  starts somewhere else, and the guard refuses a row pointing at this origin.
- The isotope id on `/isotope/giardiniera` is content-addressed. If the feature changes, the page
  changes, or the build stops.
- The manifest is **generated**, never copied from another seed: `name` comes from
  `self-card.json`, `theme_color` from `palette.json`, and every icon it names must exist. The
  guard checks all three, plus the `theme-color` and pre-stylesheet background in `index.html`.
