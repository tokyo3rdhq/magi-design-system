import {
  MagiMark,
  MagiWordmark,
  MagiLockup,
} from '@tokyo3rdhq/magi-design-system';
import { PageHeader } from './index';
import styles from './pages.module.css';

export function Brand() {
  return (
    <article>
      <PageHeader
        eyebrow="Brand Foundation"
        title="MAGI identity"
        description="Canonical brand assets and React rendering APIs. The MAGI mark, wordmark, and lockup live inside @tokyo3rdhq/magi-design-system so consumers don't ship their own."
      />

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          MagiMark
        </h3>
        <p className="magi-body-sm" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Three filled circles forming a triangle — the canonical icon.
          Used for favicon, app icon, and small lockups.
        </p>
        <div className={styles.brandRow}>
          <div className={styles.brandTile}>
            <MagiMark size="sm" />
            <span className="magi-caption">sm · 20px</span>
          </div>
          <div className={styles.brandTile}>
            <MagiMark size="md" />
            <span className="magi-caption">md · 32px</span>
          </div>
          <div className={styles.brandTile}>
            <MagiMark size="lg" />
            <span className="magi-caption">lg · 48px</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          MagiWordmark
        </h3>
        <p className="magi-body-sm" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Text-only — used standalone in doc headers or focused contexts.
        </p>
        <div className={styles.brandRow}>
          <div className={styles.brandTile}>
            <MagiWordmark size="sm" />
            <span className="magi-caption">sm · 20px</span>
          </div>
          <div className={styles.brandTile}>
            <MagiWordmark size="md" />
            <span className="magi-caption">md · 32px</span>
          </div>
          <div className={styles.brandTile}>
            <MagiWordmark size="lg" />
            <span className="magi-caption">lg · 48px</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          MagiLockup
        </h3>
        <p className="magi-body-sm" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Default logo placement — mark + wordmark composite. Use in navbars, OG images, README heroes.
        </p>
        <div className={styles.brandRow}>
          <div className={styles.brandTile}>
            <MagiLockup size="sm" />
            <span className="magi-caption">sm · 20px</span>
          </div>
          <div className={styles.brandTile}>
            <MagiLockup size="md" />
            <span className="magi-caption">md · 32px</span>
          </div>
          <div className={styles.brandTile}>
            <MagiLockup size="lg" />
            <span className="magi-caption">lg · 48px</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Color treatment via currentColor
        </h3>
        <p className="magi-body-sm" style={{ marginBottom: 'var(--magi-space-4)' }}>
          The marks use <code className="magi-code">fill="currentColor"</code>.
          Set the parent's <code className="magi-code">color</code> to drive them.
          They are <strong>stable across product accent changes</strong> — accent is product identity, brand is not.
        </p>
        <div className={styles.brandRow}>
          <div
            className={styles.brandTile}
            style={{ color: 'var(--magi-text-primary)' }}
          >
            <MagiLockup size="md" />
            <span className="magi-caption">on dark bg · white</span>
          </div>
          <div
            className={styles.brandTile}
            style={{ color: 'var(--magi-text-inverse)' }}
          >
            <MagiLockup size="md" />
            <span className="magi-caption">on light bg · black</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Accessibility
        </h3>
        <p className="magi-body-sm" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Marks default to <code className="magi-code">aria-hidden="true"</code> (decorative).
          When the mark is the only brand identifier, set <code className="magi-code">ariaHidden=&#123;false&#125;</code> and provide an <code className="magi-code">alt</code>.
        </p>
        <div className={styles.brandRow}>
          <div className={styles.brandTile}>
            <a
              href="#"
              aria-label="MAGI — home (demo)"
              style={{ color: 'var(--magi-text-primary)' }}
            >
              <MagiLockup size="md" />
            </a>
            <span className="magi-caption">inside link · aria-label</span>
          </div>
        </div>
      </section>
    </article>
  );
}
