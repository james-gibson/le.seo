---
title: Build and deploy
description: The gate, the routes, and why a tree is a shell rather than a query.
order: 1
updated: 2026-11-18
tags: build, deploy
---

```sh
npm ci
npm run dev          # vite
npm run build        # types, tokens, vite, prerender, shells, contrast, a11y, overflow, tree check, guard
npm run smoke        # render every route on the server
npm run check:tree   # the tree rules, executed
npm run isotope      # re-derive the isotope id
```

Push to `main` and the workflow does the same build. A local build is optional and runs the same
command — the deploy is a push, not an upload.

## A tree is a shell

Every `/v/<voice>/<goal>` combination is prerendered to its own `index.html`, so a tree is a real
404-free URL and its list is in the initial HTML rather than assembled after hydration. Sixteen
shells is cheap; a pitch page that needs JavaScript to say anything is not.

## What the guard refuses

- a placeholder, a local path or a credential in the shipped markup;
- a base path that disagrees with `package.json.homepage`;
- a route without its shell, or a page that never reached the bundle;
- an internal link to a route that does not exist;
- a tree route that is not in the prerender list;
- an isotope page whose id does not match `features/giardiniera.feature`;
- a link whose URL is not `https`.
