---
description: Write or revise the pitch le.seo shows for one destination, from that destination's own seed card
---

Add or revise one pitch in the le.seo register. The argument names the destination:

$ARGUMENTS

Follow `.opencode/skills/pitch-a-seed/SKILL.md`:

1. Fetch `https://<origin>/seed.json`. If it exists, quote the pitch for the voice — do not rewrite it.
2. If it exists without a line for that voice, leave the voice out, or run the `seed-card` skill in
   that seed's repository so its owner writes the line.
3. If there is no card, write the fallback `pitch` in `src/lib/tree.ts` and say it is a fallback.
4. Keep the sentence to one or two clauses: what the reader gets, in the destination's own verb.
5. Run `npm run copy`, then `npm run build` and `npm run smoke` if the register changed.
6. Commit locally. Push only when the request says publish.

Report, in this order: the destination, the voice, the sentence, and the copy gate line.
