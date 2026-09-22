# Lower "cor" + chevron by 0.5 cm when the category is open

## Goal
When a category card is **expanded** (open), move the bottom-right cluster
containing the **"cor"** button and the **down-chevron** ("setinha") **down by
0.5 cm** (~18.9px). The closed state stays exactly as it is today.

## Current structure (confirmed by reading)
- `src/routes/index.tsx` → `cartaoCategoria` (~line 613):
  - `AccordionItem` with className `"group relative flex min-h-[100px] ... overflow-hidden rounded-xl border border-black bg-clip-padding ..."` (Radix sets `data-state="open"` / `"closed"` on it).
  - The cluster is at `absolute bottom-3 right-3 z-10 flex items-center gap-2` (~line 651), holding `TrocarCorCategoria` (rotulo="cor") + the `ChevronDown` icon.
  - Because the cluster is bottom-anchored, growing the card's bottom padding moves the cluster downward by the same amount while keeping it inside the `overflow-hidden` card.

## Approach (single, surgical change)
Add a Tailwind arbitrary data-attribute variant to the `AccordionItem` className:

```text
data-[state=open]:pb-[0.5cm]
```

This adds ~0.5 cm of bottom padding **only when the category is open**, which:
- enlarges the circumscribing rectangle (the category card) downward — explicitly allowed by the user;
- shifts the bottom-anchored `cor` + chevron cluster down by ~0.5 cm;
- keeps the cluster ~12px (the existing `bottom-3`) inside the new card bottom border, so nothing is clipped;
- has no effect when the category is closed (`data-state="closed"`).

`tailwind-merge` keeps the existing classes intact (no `pb-*` conflict exists on this element).

## Scope / preservation (NOT touched)
- Closed-state layout (no change when `data-state="closed"`).
- Sizes, colors, order, and behavior of `cor` + chevron.
- The top-right cluster (`+` / Arquivar), the colored left shell, the white-content isolation, fonts, item text-color priority logic, DnD, and the `Mov. Sub / Renomear / Ok / X` action row.

## Verification
- `bunx tsgo --noEmit` passes.
- Playwright: expand "Fazer hoje"; read the cluster's `getBoundingClientRect().bottom` before vs. after. Confirm the open-state cluster sits ~19px lower than the current build, the closed-state card height is unchanged, and no console errors fire.
