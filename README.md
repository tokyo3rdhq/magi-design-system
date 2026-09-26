# MAGI Design System

Workspace for the shared MAGI frontend design system.

## Layout

```
magi-design-system/
├── packages/
│   └── design-system/         # @magi/design-system — React/TS/CSS package
└── apps/
    └── showroom/              # Vite + React showcase (visual inspection)
```

See [`packages/design-system/README.md`](./packages/design-system/README.md) for package usage.

See [`docs/magi_design_system.md`](./docs/magi_design_system.md) (in the magi-portal repo) for the design specification.

## Local dev

```bash
# In packages/design-system
npm install
npm run dev          # vite watch mode

# In apps/showroom
npm install
npm run dev          # opens the showcase
```

## Status

Phase 1 — tokens, foundation, layout primitives (Container/Section/Stack), UI primitives (Button/Card/Badge), product theme.

See [docs/magi_design_system.md §30](https://github.com/tokyo3rdhq/magi-portal/blob/main/docs/magi_design_system.md) for the migration roadmap.