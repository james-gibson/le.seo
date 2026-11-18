---
name: pitch-a-seed
description: "Use when writing or revising the pitch copy le.seo shows for a destination — a seed, a site, a template or a lab tool. Covers reading the destination's own seed card (/seed.json), choosing the voice, the copy rules the build enforces, and where the sentence lives (the seed's card first, the register's fallback second). Trigger on: pitch a seed, write marketing copy for le.seo, add a destination to the tree, revise a pitch, seed card, registry copy, voices and goals, marketing copy for the family."
---

# Pitch a seed

`le.seo` is a link tree: one voice, one goal, one ordered set of destinations. The only creative
act on the site is **the sentence**. Everything else — the order, the address, the fallback — is
computed.

Repo: `~/projects/personal/le.seo`. Live: https://james-gibson.github.io/le.seo/

## Contract

**In:** a destination (a seed, a site, a template, a lab tool) and, optionally, a voice.

**Out:** one sentence per voice it serves, where

1. Every fact in the sentence appears in the destination's own card or its plot page — nothing is
   inferred, and nothing is improved.
2. The sentence is 12–30 words, one clause or two, and ends with a full stop.
3. It says what the reader *gets*, in the destination's own verb: `take a desk`, `pick a tree`,
   `install a workspace`, `read a record`.
4. It carries no superlative and no adjective the destination did not earn (the build refuses a
   banned list; the rest is judgement).
5. `npm run copy` passes, and `npm run cards:check` passes if the sentence lives in a card.

## Where the sentence lives

**The seed owns its copy.** Read `https://<origin>/seed.json` first:

```json
{ "verb": "take a desk", "pitches": { "reader": "…", "packager": "…" } }
```

- If the card has a pitch for the voice, **quote it**. Do not rewrite it; a consumer that edits a
  seed's sentence has started inventing again.
- If the card exists but has no line for that voice, that is a fact: the seed is not pitching to
  that voice. Either leave it out or write the card **with the seed's owner** — that is the
  `seed-card` skill, and it runs in the seed's repository, not here.
- If there is no card at all, write the fallback `pitch` in `src/lib/tree.ts`, and say in the PR
  that it is a fallback. The register is a holding pen, not a second source of truth.

## The voice decides the sentence

| voice | the sentence answers | the verb it uses |
| --- | --- | --- |
| `reader` | what will I see if I open this | open, read |
| `grower` | what do I install, and how fast | install, clone, run |
| `maintainer` | what will I have to keep true | check, diff, audit |
| `packager` | what can I take and ship elsewhere | take, propose, specify |

One sentence may serve two voices only if it answers both questions without hedging. If it needs
"and also", it is two sentences and the seed owes two pitches.

## Hard rules

- **Never invent a capability.** If the card does not say a thing does X, the pitch does not say it
  does X. The failure mode of marketing copy is a promise the repository cannot keep.
- **Never repeat the site's name as the subject.** "le.ad is…" is a directory entry. Start with what
  the reader gets.
- **No superlatives, no exclamation marks, no "seamless", "powerful", "revolutionary", "best",
  "cutting-edge", "game-changing", "effortless".** The gate refuses the list.
- **No numbers the card does not carry.** "Six desks" is in the card; "the fastest" is not.
- **The order is not yours.** Readiness then name; if a destination needs to be first, change its
  `rung` and say why — that is a claim about its front door, not about the copy.

## Steps

1. Fetch the destination's `seed.json`, or read its plot record and page if it publishes none.
2. Pick the voice(s) from the card's `pitches`, or from `voices` in the register.
3. Draft one sentence per voice against the table above.
4. Run `npm run copy` — it checks length, banned words, the full stop, and that a carded
   destination's register line is not silently overriding the card.
5. If the sentence belongs in a card, open the seed's repository and follow `seed-card`. Otherwise
   update `src/lib/tree.ts` and run `npm run build` and `npm run smoke`.
6. Report: the destination, the voice, the sentence, and the gate line.

## Done when

- [ ] every sentence traces to a fact in the destination's card or page
- [ ] `npm run copy` passes
- [ ] `npm run build` passes if the register changed
- [ ] a carded destination still shows its own sentence, not the register's fallback
