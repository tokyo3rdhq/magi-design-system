import { PageHeader } from './index';
import styles from './pages.module.css';

const COLORS: { token: string; value: string }[] = [
  { token: '--magi-bg-base', value: '#000000' },
  { token: '--magi-bg-raised', value: '#1d1d1f' },
  { token: '--magi-surface', value: '#0a0a0a' },
  { token: '--magi-surface-elevated', value: '#171717' },
  { token: '--magi-text-primary', value: '#f5f5f7' },
  { token: '--magi-text-secondary', value: '#86868b' },
  { token: '--magi-text-tertiary', value: '#6e6e73' },
  { token: '--magi-border', value: 'rgba(255,255,255,0.08)' },
  { token: '--magi-border-strong', value: 'rgba(255,255,255,0.14)' },
  { token: '--magi-accent', value: '#00c853' },
  { token: '--magi-accent-hover', value: '#00e676' },
  { token: '--magi-success', value: '#30d158' },
  { token: '--magi-warning', value: '#ff9f0a' },
  { token: '--magi-error', value: '#ff453a' },
];

const SPACING = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40] as const;

export function Tokens() {
  return (
    <article>
      <PageHeader
        eyebrow="Tokens"
        title="Design tokens"
        description="All visual values are CSS custom properties. Read them directly in your styles via var(--token-name)."
      />

      <section className={styles.section}>
        <h2 className="magi-h3" style={{ marginBottom: 'var(--magi-space-6)' }}>
          Colors
        </h2>
        <div className={styles.swatchGrid}>
          {COLORS.map((c) => (
            <div key={c.token} className={styles.swatch}>
              <div
                className={styles.swatchChip}
                style={{
                  background:
                    c.token.includes('border')
                      ? 'transparent'
                      : `var(${c.token})`,
                  border: c.token.includes('border')
                    ? `1px solid var(${c.token})`
                    : undefined,
                }}
              />
              <div>
                <p className={styles.swatchName}>{c.token}</p>
                <p className={styles.swatchValue}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="magi-h3" style={{ marginBottom: 'var(--magi-space-6)' }}>
          Spacing
        </h2>
        <div className={styles.spacingList}>
          {SPACING.map((n) => (
            <div key={n} className={styles.spacingRow}>
              <span className={styles.spacingLabel}>--magi-space-{n}</span>
              <div
                className={styles.spacingBar}
                style={{ width: `calc(var(--magi-space-${n}) * 1)` }}
              />
              <span className={styles.spacingValue}>var(--magi-space-{n})</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="magi-h3" style={{ marginBottom: 'var(--magi-space-6)' }}>
          Radius
        </h2>
        <div className={styles.radiusRow}>
          {(['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const).map((r) => (
            <div key={r} className={styles.radiusItem}>
              <div
                className={styles.radiusBox}
                style={{ borderRadius: `var(--magi-radius-${r})` }}
              />
              <p className={styles.swatchName}>--magi-radius-{r}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="magi-h3" style={{ marginBottom: 'var(--magi-space-6)' }}>
          Surfaces
        </h2>
        <p
          className="magi-body-sm"
          style={{ marginBottom: 'var(--magi-space-4)', color: 'var(--magi-text-secondary)' }}
        >
          Background surfaces used by the foundation backdrop and component
          containers. The dark backdrop is a fixed gradient; surfaces layer
          on top with progressive elevation.
        </p>
        <div className={styles.surfaceRow}>
          {[
            { name: '--magi-bg-base', surfaceClass: styles.surfaceTileBase },
            { name: '--magi-bg-raised', surfaceClass: styles.surfaceTileRaised },
            { name: '--magi-bg-card', surfaceClass: styles.surfaceTileCard },
            { name: '--magi-surface', surfaceClass: styles.surfaceTileSurface },
            { name: '--magi-surface-elevated', surfaceClass: styles.surfaceTileSurfaceElevated },
          ].map((s) => (
            <div
              key={s.name}
              className={`${styles.surfaceTile} ${s.surfaceClass}`}
              data-surface={s.name}
            >
              <p className={styles.surfaceTileLabel}>{s.name}</p>
              <p className={styles.surfaceTileValue}>
                Used for the dark gradient backdrop and elevated cards.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="magi-h3" style={{ marginBottom: 'var(--magi-space-6)' }}>
          Borders
        </h2>
        <p
          className="magi-body-sm"
          style={{ marginBottom: 'var(--magi-space-4)', color: 'var(--magi-text-secondary)' }}
        >
          Two border tiers. <code className="magi-code">border</code> is
          the default for inputs, surfaces, and cards.{' '}
          <code className="magi-code">border-strong</code> marks hover
          and focus edges.
        </p>
        <div className={styles.borderRow}>
          <div className={`${styles.borderTile} ${styles.borderTileBorder}`} data-border="border">
            <code className="magi-code">--magi-border</code> · 1px · rgba(255, 255, 255, 0.08)
          </div>
          <div
            className={`${styles.borderTile} ${styles.borderTileBorderStrong}`}
            data-border="border-strong"
          >
            <code className="magi-code">--magi-border-strong</code> · 1px · rgba(255, 255, 255, 0.14)
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="magi-h3" style={{ marginBottom: 'var(--magi-space-6)' }}>
          Motion
        </h2>
        <p
          className="magi-body-sm"
          style={{ marginBottom: 'var(--magi-space-4)', color: 'var(--magi-text-secondary)' }}
        >
          Durations and easings used by transitions. All transitions are
          disabled in the showroom for screenshot determinism
          (<code className="magi-code">data-magi-app[data-screenshot-mode]</code>).
        </p>
        <div className={styles.motionRow}>
          {[
            { name: '--magi-duration-fast', value: '120ms' },
            { name: '--magi-duration-normal', value: '200ms' },
            { name: '--magi-duration-slow', value: '320ms' },
            { name: '--magi-ease-standard', value: 'cubic-bezier(.4,.0,.2,1)' },
            { name: '--magi-ease-out', value: 'cubic-bezier(.0,.0,.2,1)' },
          ].map((m) => (
            <div key={m.name} data-motion-token={m.name}>
              <code className={styles.motionToken}>{m.name}</code>
              <span className={styles.motionValue}>{m.value}</span>
              <span className={styles.motionDemo} />
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}