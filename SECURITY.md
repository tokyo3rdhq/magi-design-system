# Security

The MAGI Design System is a small, mostly-presentational package. Its attack surface is narrow, but we take vulnerabilities seriously.

## Supported versions

| Version | Supported           |
| ------- | ------------------- |
| 0.1.x   | ✅ Active           |
| < 0.1   | ❌ Not maintained   |

The package is currently in `0.x` (rapid iteration). Breaking changes are allowed within `0.x` but will be noted in [`CHANGELOG.md`](./CHANGELOG.md).

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Please report privately to: **hi@magi.website**

Include:

- Description of the vulnerability and its impact
- Reproduction steps or a minimal PoC
- Affected version(s) and any workarounds

You should receive an acknowledgement within **72 hours**. We aim to ship a fix within **30 days** for critical issues and the next minor release for lower-severity issues.

## Scope

In scope for `@magi/design-system`:

- Build-pipeline vulnerabilities (postcss, vite plugins, etc.) — report via Dependabot-style channels
- Anything in `dist/` shipped to consumers
- React component vulnerabilities affecting accessibility (XSS via unescaped children, focus-trap bypasses in future components, etc.)
- `data-magi-app` selector collisions with host applications

Out of scope:

- Host application misuse (consumer apps that apply `data-magi-app` to the wrong element, override tokens wrong, etc.) — fix in the host app
- Browser-specific bugs unrelated to the package
- Issues in dependent packages (Vite, React) — report upstream

## Disclosure

We follow a coordinated disclosure model. Please give us a reasonable window (default 90 days) before public disclosure.