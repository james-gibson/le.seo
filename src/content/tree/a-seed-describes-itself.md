---
title: A seed describes itself
description: Every seed publishes /seed.json — its own name, verb and pitch per voice — and a pitch site quotes it instead of writing copy.
order: 3
updated: 2026-11-18
tags: tree, card, self-description
---

A pitch site has a copy problem: the moment it starts writing sentences about somebody else's
seed, those sentences are its own invention, and they age without anyone noticing. The fix is the
one every other claim in this family uses: **let the thing describe itself, and quote it.**

## The card

Every seed publishes `/seed.json` at its origin. This one prints its own:

```json
{
  "version": 1,
  "id": "le.seo",
  "name": "le.seo",
  "preferred": "le.seo",
  "verb": "pick a tree",
  "kind": "seed",
  "live": "https://james-gibson.github.io/le.seo",
  "repo": "james-gibson/le.seo",
  "rung": 1,
  "description": "Marketing optimisation for a collection of seeds…",
  "pitches": {
    "reader": "A short, ordered tree of the family…",
    "packager": "The giardiniera isotope: an assortment served in one order…"
  },
  "voices": ["reader", "grower", "maintainer", "packager"],
  "goals": ["try", "adopt", "verify", "fund"],
  "ships": ["silverskin", "cornichon", "giardiniera"],
  "builtFrom": ["silverskin", "cornichon"],
  "card": "https://james-gibson.github.io/le.seo/seed.json"
}
```

The field that matters is `pitches`, keyed by **voice**. The same seed says a different true thing
to a reader than to a packager, and the seed's owner is the only one who can write both. A voice
with no line is a voice the seed is not pitching to — that is a fact, not an omission.

The card is generated from the same file the page imports, so the published card and the rendered
site cannot disagree about a string.

## How a consumer uses it

`le.seo` quotes one card today — `le.ad`'s — and publishes its own at `/seed.json` for other sites to
quote. It does not quote itself: a destination is somewhere a reader can go, and the page under
their feet is not one. The register falls back to its one-line copy for everything else.
**Vendored, not fetched**: the build is offline and stays offline.

The copy is pinned by `scripts/cards.mjs`, which re-fetches every card the register names and
compares it with `src/cards/<id>.json`:

```sh
npm run cards          # write the vendored copies
npm run cards:check    # fail when a seed has moved
```

`cards:check` runs in CI. It is the same trade as a vendored `rules.md`: a copy with a catch-up
check is a claim that can fail; a fetch at build time would make this build depend on eleven
origins and would not work on a plane.

## The skills

Writing the copy is the only creative act here, so it ships as two skills rather than a style guide
nobody opens:

- **`pitch-a-seed`** — read the destination's card, pick the voice, write one sentence against the
  voice table, run `npm run copy`. It refuses to rewrite a card's sentence: a consumer that edits a
  seed's copy has started inventing again.
- **`seed-card`** — for a seed that publishes no card. It runs *in that seed's repository*, drafts
  `self-card.json` from the seed's own record, and wires the build step. A pitch site that writes
  another seed's card is inventing one layer down.

`/pitch <destination>` is the command that runs the first one. `npm run copy` is the gate they both
end on: length, a banned list of superlatives, a full stop, no sentence that starts with a name.

## What it changes

- **The copy belongs to the seed.** A pitch site that quotes cannot improve the sentence, and it
  cannot quietly make it better than the truth.
- **A stale quote is a build failure.** The check compares content, not the `generated` date, so a
  rebuild of the same seed does not churn a diff, but an edited pitch does.
- **A card is a start, not a substitute.** Twelve destinations and two quoted cards is the honest
  state; the rest publish a one-line pitch in this register until they publish their own.
- **A site does not list itself.** The seed publishes a card so other sites can quote it; quoting it
  back to a reader who is already here is a row that can only be a no-op.

## What it costs

- **Eleven more repositories to touch.** A card is a new published artefact per seed, and each one
  needs its own build step and its own guard line.
- **A check that needs the network.** CI gains a dependency on every card's origin being up. When
  one is unreachable the check says so rather than pretending the copy is current — but it will
  fail the build, and that is the point.
