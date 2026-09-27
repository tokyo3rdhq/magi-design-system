# ADR-006: React peer range — 18.x for 0.x, expand to `18 || 19` as minor when needed

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-09-27 |
| **Scope** | `@tokyo3rdhq/magi-design-system` 0.x → 1.0 |

## Context

The package currently declares:

```json
"peerDependencies": {
  "react": "^18.0.0",
  "react-dom": "^18.0.0"
}
```

When React 19 ships, we need to decide:

- Block 0.x releases on React 19 (force a major bump to 1.0)
- Add React 19 to peer range as a minor change
- Stay on React 18 only (ignore React 19)

The architecture review (§13 in `architecture-review-v2.md`) challenged the original roadmap of "1.0 = React 19 support".

## Decision

**Stay on React 18 for now. Add React 19 to peer range as a MINOR change when needed. Do not gate 1.0 on React major.**

### Rationale

The Design System major version is driven by **Design System public contract changes**, not by upstream React major versions.

Breaking changes that justify a major bump:
- Removed primitives
- Removed/renamed props
- Token renames/removals
- CSS contract changes (selector patterns)
- DOM contract changes (e.g., removing the `<div>` wrapper)

React major version changes do **not** automatically trigger Design System major bumps. The two evolve independently.

### When to expand peer range

- When a MAGI product (magi-portal / tfi / future) upgrades to React 19
- When a future consumer asks for React 19 support
- NOT preemptively before any consumer needs it

### Version matrix

| DS Version | React Peer Range | Notes |
|---|---|---|
| 0.1.0 | `^18.0.0` | Initial |
| 0.2.0 | `^18.0.0` | Phase 4 primitives |
| 0.3.0 | `^18.0.0` | Theme + layers (this release) |
| 0.4.0 (future) | `^18.0.0 \|\| ^19.0.0` | When a consumer asks for 19 |
| 1.0 | `^18.0.0 \|\| ^19.0.0` | 1.0 is for **our** contract changes |

### Duplicate React risk

When two products in the same host app use different React majors (18 vs 19), only one wins. This is a host-application concern, not the Design System's. The DS supports both; the host must deduplicate.

## Alternatives considered

### Gate 1.0 on React 19

- **Pro**: aligns DS major with React major; cleaner semver.
- **Con**: our 1.0 is supposed to be when **our** contract changes, not when React changes. Mixing these concerns muddles the version meaning.

### Drop React 18, ship React 19 only

- **Pro**: forward-looking.
- **Con**: breaks magi-portal (on 18) and tfi (on 18). Massive churn.

## Consequences

- **0.x consumers**: stay on React 18. No forced upgrade.
- **0.4.0 (likely)**: when a consumer asks, expand peer range to `^18 || ^19`. This is **a minor change** because:
  - Our API doesn't change
  - React 18 → 19 is mostly additive for our usage (no breaking render changes for our primitives)
- **1.0**: when our contract changes (DOM removal, token rename, etc.). React peer range may already include 19 by then.

## References

- [Architecture review §13](architecture-review-v2.md) — "KEEP WITH MODIFICATION"
- [Spec §29 — React Version Strategy](https://github.com/tokyo3rdhq/magi-portal/blob/main/docs/magi_design_system.md)