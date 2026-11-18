---
name: seed-card
description: "Use when a seed publishes no /seed.json, or its card is out of date. Covers drafting self-card.json from the seed's own record (name, verb, rung, isotopes), writing one pitch per voice, rendering it to /seed.json at build time, and the checks that keep the card honest. Runs in the seed's own repository, never in the pitch site. Trigger on: seed card, seed.json, self-card, describe this seed, publish a card, le.seo card, pitch per voice, seed definition."
---

# Seed card

A pitch site should quote a seed, not describe it. The seed's card is that quote: a small JSON file
published at `/seed.json`, generated from a source file the site already imports, so the published
card and the rendered page cannot disagree.

**Run this in the seed's repository.** A pitch site that writes another seed's card is inventing
again, one layer down.

## Contract

**Out:** a card and a build step, where

1. `src/lib/self-card.json` is the single source, and `src/lib/self.ts` gives it a type.
2. `scripts/seed-card.mjs` renders it to `public/seed.json` on every build, adding `generated` and
   the card's own URL.
3. `/seed.json` answers 200 on the deployed origin.
4. Every voice the seed serves has a sentence; every voice it does not serve is absent.
5. The guard refuses a card with no pitches, a non-https `live`, or a card that disagrees with the
   source.

## The shape

```json
{
  "version": 1,
  "id": "le.ad",
  "name": "le.ad",
  "preferred": "le.ad",
  "verb": "take a desk",
  "kind": "seed",
  "live": "https://james-gibson.github.io/le.ad",
  "repo": "james-gibson/le.ad",
  "rung": 1,
  "description": "one sentence, the same one the site uses",
  "pitches": { "reader": "…", "maintainer": "…" },
  "voices": ["reader", "maintainer"],
  "goals": ["try", "verify"],
  "ships": ["silverskin"],
  "builtFrom": ["silverskin"]
}
```

`preferred` is the name people say when the published one is forced by tooling
(`@lemon/ade-stand` vs `@lemon/create-ade-stand`). `verb` is what you do with it, in the tool's own
syntax. `ships` is what it publishes; `builtFrom` is what it is built on — the difference is the
family's whole point.

## Rules

- **`description` is the site's own subtitle**, not a new sentence written for the card. Two
  descriptions of one seed is two sources of truth.
- **`pitches` is keyed by voice, and the owner writes it.** A missing voice means the seed is not
  pitching to that reader; do not pad it.
- **No fact appears here that the site does not already state.** The card is a projection, not a
  press release.
- **`live` is https and is the origin the site actually serves from.**

## Steps

1. Copy `self-card.json`, `self.ts` and `seed-card.mjs` from a seed that has them (`le.ad`, `le.seo`).
2. Fill the fields from the seed's own record — plot row, page description, isotopes.
3. Prepend `node scripts/seed-card.mjs &&` to `build`.
4. Add the guard lines: `/seed.json` present, parses, id matches, pitches exist.
5. Build, deploy, then confirm `/seed.json` on the origin.
6. Tell the pitch site's owner; they run `npm run cards` to vendor the new copy.

## Done when

- [ ] `npm run build` renders `dist/seed.json`
- [ ] the deployed `/seed.json` answers 200
- [ ] the card's `description` is the site's own
- [ ] at least one voice has a sentence the seed's owner wrote
