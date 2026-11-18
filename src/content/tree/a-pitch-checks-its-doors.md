---
title: A pitch checks its doors
description: Every destination is a door, and the build knocks — the front door must answer, and a link must not be written from the origin when the site lives under a mount.
order: 4
updated: 2026-11-18
tags: tree, doors, links, guard
---

# A pitch checks its doors

A tree is a list of places to go next, which makes every destination a **door**. Until this rule,
`le.seo` could prove a door was https and could not knock. It shipped a register in which two doors
answered 404, and it would have called the page ready.

The defect that forced the rule was worse than a dead link. A seed shipped with root-absolute paths
— `/collections/`, `/seed.json` — while GitHub Pages served it under `/le.stalk/`. Every page
answered 200 at its own address; every link between them left the mount and 404ed. The pitch site
was linking to it and had nothing to say.

## The rule

`npm run doors` fetches each destination's front door and reads the links it offers.

1. **The front door must answer.** A destination that does not answer is not a destination. (A
   `401`/`403` is reported as *guarded*: the page exists and refuses this client, which is a fact
   about the door, not a failure of the pitch.)
2. **A link written from the origin must stay under the site's mount.** A root-absolute or relative
   `href` is resolved against the origin, so it silently assumes the site is mounted at `/`. Under
   `/le.stalk/`, `/collections/` is a link to a different site's root — even if that path happens
   to exist.
3. **An explicit absolute link may cross to a sibling seed.** `https://…/le.gume/` says what it
   means. The mount rule is about implicit paths, not about the family pointing at itself.

## What the check found on its first run

- **Two 404s.** `fire-marshall` is a local-only counter display with no public door — it is not a
  destination, so it left the register. `@lemon/ade-stand`'s GitHub repository is private, so the
  public door is now the npm package page; the pitch always said `npm create`, and now it links
  where the command lives.
- **No mount escapes left** among the published seeds: 163 links checked across 12 destinations.

## What it is not

- **Not a crawler.** It reads the front door, one level, capped at forty links. A broken page two
  clicks in is not caught, and saying so is cheaper than pretending otherwise.
- **Not offline.** `npm run doors` needs the network, so it runs in CI beside `cards:check`, not in
  the build. A guard that needs the network cannot be the guard that decides whether a page is
  correct.
- **Not a proof of life.** A 200 is a door that opened for one client at one moment. It is a floor,
  not a promise.

## Why it belongs to the pitch and not the plot

The plot records what a seed **is**; the pitch claims what a reader should **open**. Every claim on
this site is an invitation, and an invitation to a 404 is the one failure a visitor cannot forgive.
So the check lives here, next to the register it audits, and it is run before every deploy.
