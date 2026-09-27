# ADR-008: Visual regression — defer Playwright screenshots to 0.4.0

| | |
|---|---|
| **Status** | Deferred (see ADR-0007) |
| **Date** | 2026-09-27 |
| **Scope** | `@tokyo3rdhq/magi-design-system` 0.4.0 |

## Context

Visual regression protects the design language from drift. The architecture review (§11 in `architecture-review-v2.md`) recommended shipping Playwright visual regression in 0.3.0 alongside axe-playwright.

## Decision

**Defer to 0.4.0.** (See ADR-0007 for the combined deferral rationale.)

### 0.4.0 scope (planned)

- `@playwright/test` devDep
- `apps/showroom/playwright.config.ts`
- `apps/showroom/tests/visual.spec.ts` — uses Playwright's built-in `toMatchSnapshot`
- Baselines generated locally with `npx playwright test --update-snapshots`
- Baselines committed to repo (~70 PNGs, ~700 kB)
- CI job: boots showroom preview, runs `playwright test`, fails on diff

### Snapshot matrix

| Component | States |
|---|---|
| Button | default, hover, focus, disabled (4 variants × 4 states = 16) |
| Card | default, elevated, interactive × 4 paddings |
| Badge | 5 variants × dot on/off |
| Checkbox | checked, unchecked, focus, disabled × with/without label |
| Input | 3 sizes × default, focus, invalid, disabled |
| FormField | helper / error / no message |
| Segmented | default, accent, focus |
| Banner | 4 variants |
| EmptyState | simple, structured |
| Container | 6 sizes |
| Section | 4 spacings |
| Stack | column, row × gaps |

Approximate count: ~70 baselines.

### Storage

- Playwright's `toMatchSnapshot` writes PNG snapshots to `apps/showroom/tests/snapshots/`
- These are git-tracked (~700 kB total)
- Diff on PR is visual; CI fails if pixel hash differs

## Alternatives considered

### Storybook + Chromatic

- **Pro**: dedicated visual regression platform.
- **Con**: Storybook is forbidden per spec §34 (would add ~50 MB). Chromatic is a paid service. Not justified for one team.

### Percy / Applitools / Chromatic

- **Pro**: cloud-based, handles baselines.
- **Con**: paid, external dependency. Spec §4 forbids framework lock-in.

### Playwright `toHaveScreenshot()` (the chosen approach)

- **Pro**: built into Playwright (no extra deps), text-based diffs, works in CI.
- **Con**: 70 baselines is real maintenance.

## Consequences

- **0.3.0**: no visual regression. Maintainer visually verifies each release against the showroom.
- **0.4.0**: visual regression active. Every CSS change requires `npx playwright test --update-snapshots` locally, then commit new baselines.
- **Iteration cost**: ~5-10 minutes per visual change in 0.4.0+.
- **Protection**: catches design-language drift before it reaches consumers.

## References

- [Architecture review §11](architecture-review-v2.md)
- [ADR-0007 — Accessibility](0007-accessibility.md)