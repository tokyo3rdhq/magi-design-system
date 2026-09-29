import { useState } from 'react';
import { Button, Badge } from '@tokyo3rdhq/magi-design-system';
import { PageHeader } from './index';
import styles from './pages.module.css';

type Theme = 'dark' | 'light';
type Accent = 'green' | 'cyan' | 'violet' | 'amber' | 'white';

const ACCENTS: Accent[] = ['green', 'cyan', 'violet', 'amber', 'white'];

/**
 * Theme × Accent matrix page.
 *
 * Visual contract surface. Renders a 1×5 (per-theme) or 2×5 (Dark + Light) grid
 * of accent variations with a Button and a Badge in each cell. Lets a reviewer
 * visually verify:
 *   - Dark × {green, cyan, violet, amber, white} (5 cells)
 *   - Light × {green, cyan, violet, amber, white} (5 cells)
 *
 * Each cell uses `data-accent="<name>"` to drive a CSS-only subtree accent
 * override (matching the @tokyo3rdhq/magi-design-system contract). This is
 * the canonical visual contract surface for screenshot regression once
 * Playwright is adopted per ADR-0008.
 *
 * Animated by default; pass `data-magi-app[data-screenshot-mode]` from the
 * URL hash (e.g. `#screenshot`) to disable transitions for deterministic
 * capture.
 */
export function Matrix() {
  const [theme] = useState<Theme>('dark');

  return (
    <article>
      <PageHeader
        eyebrow="Visual contract"
        title="Theme × Accent matrix"
        description="Visual regression surface. Renders the 5 accent presets against the canonical theme backdrop. Each cell uses data-accent to drive a subtree accent override — pure CSS, no React AppTheme needed."
      />

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          {theme === 'dark' ? 'Dark × Accent' : 'Light × Accent'}
        </h3>
        <p
          className="magi-body-sm"
          style={{ marginBottom: 'var(--magi-space-4)', color: 'var(--magi-text-secondary)' }}
        >
          Subtree accent via <code className="magi-code">data-accent</code>.
          The accent variable cascades to every descendant Button and Badge
          in the cell. Switch the global theme in the top nav to render the
          Light variant of the same matrix.
        </p>

        <div className={styles.matrixGrid} data-matrix-theme={theme}>
          <div />
          {ACCENTS.map((a) => (
            <div key={`label-${a}`} className={styles.matrixAccentLabel}>
              {a}
            </div>
          ))}

          <div className={styles.matrixRowLabel}>Button · primary</div>
          {ACCENTS.map((a) => (
            <div
              key={`btn-${a}`}
              className={styles.matrixCell}
              data-accent={a}
              data-cell={`${theme}-button-${a}`}
            >
              <Button variant="primary">Primary</Button>
            </div>
          ))}

          <div className={styles.matrixRowLabel}>Badge</div>
          {ACCENTS.map((a) => (
            <div
              key={`badge-${a}`}
              className={styles.matrixCell}
              data-accent={a}
              data-cell={`${theme}-badge-${a}`}
            >
              <Badge variant="accent" dot>
                {a}
              </Badge>
            </div>
          ))}

          <div className={styles.matrixRowLabel}>Both stacked</div>
          {ACCENTS.map((a) => (
            <div
              key={`combo-${a}`}
              className={styles.matrixCell}
              data-accent={a}
              data-cell={`${theme}-combo-${a}`}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--magi-space-3)' }}
            >
              <Button variant="primary">{a}</Button>
              <Badge variant="accent" dot>
                {a}
              </Badge>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}