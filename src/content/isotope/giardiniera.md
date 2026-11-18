---
title: The giardiniera isotope
description: A mixed assortment served in one order — the isotope le.seo introduces, and the pickles it is built from.
order: 1
updated: 2026-11-18
tags: isotope, tree, giardiniera
---

# The giardiniera isotope

Giardiniera is a jar of pickled vegetables — several kinds, each still recognisable, arranged
rather than mashed. That is the procedure this seed adds to the shelf: **an assortment chosen for
one voice and one goal, served in one order.**

It is on the shelf in the only sense that matters: the name describes the shape (mixed, arranged),
not a flavour, a tool or the language the spec is written in.

## The identity

```text
isotope    ZgVQ80r7ADxBdbXxNGqFFTksN_ixvGwaaTCvIaYWO3o
signature  65fb933e3b6c4170…  (hmac-sha256, key seed-42)
canon      51 tokens, 10 parts
source     features/giardiniera.feature
```

Run `npm run isotope` to re-derive it with the real canon. If the number above is not what that
command prints, the page is wrong and the build should be stopped.

## What it adds to the shelf

| rule | the tree does |
| --- | --- |
| one voice, one goal | two values choose the set; neither is optional |
| never empty | falls back to the voice, then to everything, and says which |
| ordered | readiness first, then name — the least demanding door first |
| no repeats | a destination appears once per tree |
| reusable across trees | one destination may serve several voices |
| kind-agnostic | a project, a tool or a seed is pitched by the same rules |
| citable | the record is the two values and the ids, in order |

## Built from the existing pickles

le.seo ships this isotope alongside the ones it is built from:
[silverskin](https://james-gibson.github.io/le.gume/isotopes/silverskin/) for the site shape and
[cornichon](https://james-gibson.github.io/le.gume/isotopes/cornichon/) for the recurring check.
That is the family pattern: a new isotope does not replace the ones under it, it names what it
adds.

## Status: proposed

This is the isotope's first home. The proposal is to file it upstream as
`isotope/features/giardiniera.feature` beside the others, with the ordering rule stated as policy
rather than derived — because "readiness first, then name" is an editorial decision, and an
editorial decision should be visible enough to argue with.
