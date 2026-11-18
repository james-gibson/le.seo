---
title: The pickled-egg isotope
description: Install metadata generated from the seed's own card, wall and mark — the isotope that refuses a copied manifest.
order: 2
updated: 2026-11-18
slots: seed, wall, mark, doors
tags: isotope, manifest, install
---

# The pickled-egg isotope

A pickled egg is one item in a jar, and the jar has a label. The item is not interesting; the
**label** is, because it is the only part of the jar that tells you what you are holding.

That is the procedure this seed adds to the shelf: **install metadata generated from the seed it
belongs to, and refused when it is not.** A manifest is the label — `name`, `short_name`, the
theme colour, the icons — and a label copied from another jar describes the wrong thing.

It is on the shelf in the only sense that matters: the name describes the shape (one item,
preserved, labelled), not a flavour, a tool or the language the spec is written in.

## The identity

```text
isotope    3p8zfPr0HLXn5zRYkh6hllzQGJLX-5g7mQRs4SFhYWw
signature  82352c55a6435eaf…  (hmac-sha256, key seed-42)
canon      38 tokens, 8 parts
source     features/pickled-egg.feature
```

Run `npm run isotope` to re-derive it with the real canon. If the number above is not what that
command prints, the page is wrong and the build should be stopped.

## The instruction slots

Four slots. Each one names the source of a field, so the fill is a pointer rather than a value —
which is the whole isotope: a field that is typed twice is a field that will disagree with itself.

| slot | fill with | what the generator does |
| --- | --- | --- |
| `seed` | the seed's own card, `/seed.json` (`src/lib/self-card.json`) | `name` is the card's name and verb, `short_name` is `preferred`, `description` is the card's own sentence. Nothing is retyped, and a card edit moves the app title with it. |
| `wall` | the palette token named `ink` | `theme_color` and `background_color` are that token; so are the document's `theme-color` and the first frame painted before any stylesheet is fetched. Four places, one colour. |
| `mark` | a glyph, drawn in the seed's palette tokens | 180, 192 and 512 PNGs, a maskable crop with the crown inside the safe circle, and the tab SVG from the same geometry. No exported PNG, because an export is a file nobody can regenerate or review. |
| `doors` | zero to four tree addresses | each shortcut is relative to the manifest and must resolve to a **prerendered** page. A shortcut to a route without a shell opens the app and then 404s. |

## The four refusals

The generator is small and the guard is the interesting half. A build stops when:

1. **the manifest disagrees with the card** — a `short_name` or `description` that is not the
   card's is a second source of truth, and the second one always wins by accident;
2. **the theme is not the wall** — `theme_color` or `background_color` naming a colour the palette
   does not declare means the installed window frame is painted from a stale copy;
3. **an icon is named but missing** — a manifest that lies about an icon fails install on every
   launcher that trusts it, and silently;
4. **a colour from the seed it was cut from survives** — the document is searched for the previous
   palette's hexes, because the failure this isotope exists for was a copy that looked finished.

## Why the isotope and not a checklist

A checklist is read once, by the person who already knows. A generator plus a guard is read every
build, by nobody, and refuses. The slot table above is the checklist; the four refusals are the
part that survives a hurried afternoon.

The evidence is the defect it was extracted from: `le.seo` shipped with `le.ad`'s install
apparatus — its steelblue as the theme, a favicon announcing `le.ad`, an `og:image` naming icons
that had never been drawn, and no manifest at all. Every one of those is a slot left copied instead
of filled.

## Built from the existing pickles

This seed still carries [silverskin](https://james-gibson.github.io/le.gume/isotopes/silverskin/)
for the site shape and [cornichon](https://james-gibson.github.io/le.gume/isotopes/cornichon/) for
the recurring check. `pickled-egg` is a third, and it does not replace either: it names the label
on the jar, which neither of them had a slot for.

## Status: proposed

This is the isotope's first home. The proposal is to file it upstream as
`isotope/features/pickled-egg.feature` beside the others, with the four refusals stated as policy —
because "generated, not copied" is already this family's rule, and this is the first isotope that
applies it to the install metadata rather than the content.
