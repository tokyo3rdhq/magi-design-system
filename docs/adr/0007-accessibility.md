# ADR-007: Accessibility — token literal CI + visual regression baseline at 0.3.0; axe / Playwright deferred to 0.4.0

| | |
|---|---|
| **Status** | Accepted (with deferral) |
| **Date** | 2026-09-27 |
| **Scope** | `@tokyo3rdhq/magi-design-system` 0.3.0 |

## Context

The architecture review (§10, §11 in `architecture-review-v2.md`) requested five CI checks in 0.3.0:

1. Token literal enforcement — fail on hex / rgb / rgba outside `tokens/`
2. `axe-playwright` — automated a11y checks on the showroom
3. Playwright focus ring verification
4. Playwright reduced-motion verification
5. Playwright visual regression (per-primitive screenshots)

The review's verdict was "all five in 0.3.0".

## Decision

**0.3.0 ships checks #1. Checks #2-5 deferred to 0.4.0.**

### Rationale for deferring Playwright checks

Adding Playwright as a CI dependency in 0.3.0:

- Adds `@playwright/test` as devDep (~150 MB chromium binary)
- Requires Playwright config + test files
- Requires generating baseline snapshots (~70 PNGs)
- Adds CI time (~30s for the full suite)
- Coordinates with the showroom preview server boot order

This is significant new infrastructure for one minor release. Defer to 0.4.0 where it can have its own focused release notes.

### What 0.3.0 actually ships

- ✅ `scripts/check-tokens.mjs` — runs in CI, fails on hex / rgb / rgba literals in component CSS. Already implemented. 0 errors, 0 warnings at 0.3.0.
- ❌ axe-playwright / focus / reduced-motion / visual regression — deferred to 0.4.0.

### What 0.4.0 will ship

- Add `@playwright/test` to `apps/showroom` devDeps (or root devDeps)
- `apps/showroom/playwright.config.ts`
- `apps/showroom/tests/a11y.spec.ts` — runs axe on each showroom page
- `apps/showroom/tests/visual.spec.ts` — `toMatchSnapshot` per primitive state
- `apps/showroom/tests/focus.spec.ts` — verifies focus-visible ring on each interactive primitive
- `apps/showroom/tests/reduced-motion.spec.ts` — verifies transitions disabled under prefers-reduced-motion
- GitHub Actions job: `tests` (depends on `package` and `showroom` builds, runs `playwright test`)

### Why this is still a 0.3.0 → 0.4.0 valid split

0.3.0 is **architecture** changes (theme fix, @layer, token enforcement).
0.4.0 is **infrastructure** changes (Playwright + tests).

Mixing them into one release makes both harder to review.

## Alternatives considered

### All 5 in 0.3.0 (review's recommendation)

- **Pro**: matches the review's verdict, immediate protection.
- **Con**: significant new infra in one release. Mixing architecture and infra changes is hard to review.

### Drop token literal check

- **Pro**: smaller 0.3.0 scope.
- **Con**: token literal check is cheap (no deps, ~5s runtime) and catches the highest-impact drift class (raw hex/rgba in component CSS). Keeping it costs little.

## Consequences

- **0.3.0**: ~24 kB CSS, token enforcement active. No regression tests for visual / a11y / focus / motion. Risk: a future change to design system could regress visual or a11y without CI catching it.
- **0.4.0**: Playwright infrastructure + ~70 baselines + CI job. Subsequent visual changes require updating baselines.
- **Acceptable risk** because:
  - We have 2 consumers, both visually verified by maintainer
  - Token literal check catches the most common drift
  - Showroom serves as a manual visual regression surface

## 0.5.x status

- **0.5.0** shipped the Brand Foundation. No accessibility / Playwright changes — the brand foundation adds SVG assets and React rendering APIs (decorative by default; configurable `ariaHidden` / `alt` for meaningful use). See [`docs/component-contracts.md#magimark`](../component-contracts.md#magimark) for the per-component contract.
- **0.5.1** added the Component Contracts doc (`docs/component-contracts.md`). Per-component contracts now document the expected a11y behavior as part of the framework-agnostic contract layer. Any future Vue implementation must honor the same keyboard / ARIA / focus contracts.
- **Playwright a11y / visual regression remain deferred.** The deferral rationale still holds (2 consumers, maintainer visual verification, ~150 MB chromium binary, ~70 baseline maintenance cost). The deferred status is tracked in `docs/architecture-review-framework-agnostic.md` §30 "5 Things To Defer".

## References

- [Architecture review §10, §11](architecture-review-v2.md)
- [Spec §21 — Accessibility](https://github.com/tokyo3rdhq/magi-portal/blob/main/docs/magi_design_system.md)
- [Spec §20 — CodeBlock](https://github.com/tokyo3rdhq/magi-portal/blob/main/docs/magi_design_system.md)