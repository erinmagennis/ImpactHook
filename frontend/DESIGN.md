# ImpactHook — Design System

Single source of truth for the look, feel, and components. Use this when building or
cascading the design across pages so everything stays consistent. Tokens live in
`app/globals.css`; shared primitives live in `components/`.

## North star
Dark, precise, audit-grade — **with a human heart**. Borrow the rigor of Linear / Dune
(dark, restrained, data-forward) and the polish of Stripe (whitespace, premium motion), but
unlike those cold products, **weave human/impact warmth throughout** (real photos, warm
relational copy, the outcome always tied to who it reached). We are infrastructure *with* a
purpose — that contrast is the differentiation. Dark is also on-brand for UNICEF's Office of
Innovation (their own deck is black + a bright accent).

## Identity / logo motif
The logo is **gray code-brackets `< >` wrapping a teal checkmark** (`components/Brand.tsx` →
`BrandMark`). Meaning: the checkmark = the *verified* state; the brackets = *open-source /
onchain*. Together: "verified onchain." It recurs as a brand element and **animates** (the
check draws in) on verification moments (`animate` prop; `.brand-check-animate`).

## Color
Tokens in `:root` (`globals.css`). **One accent (teal). No second loud color.**
- Backgrounds (warm near-black ladder): `--bg-primary #0a0b0d` → `--bg-card #131519` → `--bg-elevated #1a1d23` → `--bg-surface #23262d`. Cards render `#181b21` with a clearer border `#2e333c`.
- Accent: `--accent #0d9488`, `--accent-light #2dd4bf`. Teal is the **only** action color and the verified color.
- Slate (quiet neutral, links/info, never competes with teal): `--slate #64748b`, `--slate-light #94a3b8`.
- **Status semantics are LOCKED:** emerald/teal = verified·released·success; amber `--warning` = pending; red `--error` = failure only. Never decorative.
- A single warm gold `#caa46a` is reserved for the Pantheon "values figure" seat only.
- Rules: reserve teal for action + verified; **green appears only where something is verified**; no violet anywhere; no glow/orbs; contrast via color + spacing, not effects.

## Typography
- **Satoshi** (display/UI) + **JetBrains Mono** (`.font-data`) for all numbers/hashes/onchain data.
- **Hard rule: monospace is for data only.** This single rule signals "audit-grade."
- Scale: `.heading-display` (clamp 40–60, hero) · `.heading-xl/lg/md/sm` · `.text-body` 16 · `.text-small` 14 · `.text-caption` 12. `.text-superhead` = teal eyebrow (15px, 600).
- `.accent-word` = the teal word in a two-tone headline (white + teal). Used on hero + section openers.

## Surfaces & layout
- `.card` — lifted surface, hairline border, inset top-highlight, subtle hover. One job/metric per card.
- 2-step elevation: page → card → elevated. Softened borders (Linear 2025 lesson), minimal shadows.
- Section rhythm: alternate plain `container` sections with `bg-card` sections for a subtle dark-on-dark rhythm. **All dark** (no light/white sections currently — the dark/white mix read as noisy).
- Big **centered teal section divider** for major openers (e.g. the "How it works" heading opening the 01-02-03 journey).
- `.feature-row` — alternating text + framed screenshot rows (show-don't-tell). Reverse with `.reverse`.
- Avoid stacking many identical card grids — vary with diagrams, accordions, screenshots, feature rows.

## Components (`components/`)
- **Brand.tsx** — `BrandMark`, `BrandLockup`, `CircleCutout` (UNICEF circular-photo motif; falls back to a labeled slot), `ImageSlot` (placeholder + sourcing hint), `ProofRow` (a verified artifact shown with pride: human statement + mono hash + explorer link), `StatusPill` (verified/pending/idle), `DataFreshness` ("Synced at block N").
- **HeroFlow.tsx** — the hero IS a scroll-driven flow (fund → escrow → evidence → verified → released → outcome). Only the active step expands; left column narrates + shows a **tech tag** per step. Reduced-motion shows the completed flow statically.
- **FundingFlow.tsx** — convergence diagram (4 channels → one gate); lines draw on scroll.
- **Committee.tsx** — Pantheon committee: centered bench of seat chips (color-coded by kind) with **measured per-seat lines** (refs + ResizeObserver) drawing to a centered signed-verdict box. `compact` for the homepage.
- **useInView.ts** — IntersectionObserver hook; adds `in-view` to trigger `.reveal` / `.draw-path`.
- Patterns in CSS: `.accordion` (native `<details>`), `.tech-tag` (mono pill naming the stack at a step), `.proof-row`, `.status-pill`, `.principle-card` (hover bounce), `.image-slot`.

## Motion
Functional only — never ambient/looping. The vocabulary: in-view fade/`.reveal`, the **checkmark draw** on verify, `.draw-path` line draws, the scroll-driven hero, hover lifts, focus rings. Spring `cubic-bezier(0.32,0.72,0,1)`. Always respect `prefers-reduced-motion`.

## Imagery
- **Default to clean type + data + logo-motif graphics.** Use real, dignified, in-context photos only where they genuinely exist (the user sources them; `ImageSlot`/`CircleCutout` mark the slots). UNICEF's own deck uses joyful child photos — **dignified photography is right here**; only exploitative "poverty-porn" stock is the thing to avoid.
- The **circle-cutout** photo treatment is the signature human motif (echoes UNICEF Office of Innovation).
- Pair every number with its human result (proof + the child), and surface proof artifacts (tx, attestation, block) with pride (`ProofRow`), charity:water-GPS style.

## Navigation / IA
- **Landing nav** = the landing only (on-page anchors + Launch App + GitHub). One door into the app.
- **App nav** (`Navigation.tsx`) = tools as direct links (Swap/Dashboard/Donate + role tools) **+ a persistent "Learn ▾" dropdown** for content pages (Impact, Agent, Pantheon, Technical). Never mix tools and learn pages in the flat row. Role selector = Trader/Project/Sponsor.
- Homepage links *out* to deep pages from their matching section ("See how the committee works →", "See the full architecture →", "Read the accountability story →").
- TODO (cascade): give the learn pages a lighter nav (vs the dApp role nav) so they read as learn, not tools.

## Visual do / don't
- DO: one teal accent · mono for data only · big whitespace + strict hierarchy · diagrams/screenshots/accordions over repeated card grids · proof shown with pride · dignified real photos · the logo motif woven in.
- DON'T: a second loud color · decorative green · violet · glow/orbs/ambient motion · stacked identical card grids · `overflow:hidden` on a sticky ancestor (use `overflow-x: clip`) · stock "poverty-porn" imagery · centered text fighting left-aligned text in the same block (frame it in a card or pick one).

## Reference bar (current versions)
Linear (dark, restrained, teal-on-black) · Stripe (premium editorial whitespace + motif-in-imagery) · Mercury (product dashboard in hero, human faces + warm copy, data as anchor) · Dune (big numeric callouts, audit-grade). Plus: charity:water / UNICEF for dignified human imagery.
