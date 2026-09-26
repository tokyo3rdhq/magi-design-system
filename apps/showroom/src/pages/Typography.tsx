import { PageHeader } from './index';
import styles from './pages.module.css';

export function Typography() {
  return (
    <article>
      <PageHeader
        eyebrow="Foundation"
        title="Typography"
        description="Inter for UI, with a coherent scale from display to caption."
      />

      <section className={styles.section}>
        <div className={styles.typeRow}>
          <code className="magi-code">.magi-display</code>
          <p className="magi-display">Display 72 / Semibold / -0.045em</p>
        </div>
        {(['h1', 'h2', 'h3', 'h4'] as const).map((lvl) => (
          <div key={lvl} className={styles.typeRow}>
            <code className="magi-code">.magi-{lvl}</code>
            <p className={`magi-${lvl}` as 'magi-h1'}>Heading {lvl.toUpperCase()}</p>
          </div>
        ))}
        <div className={styles.typeRow}>
          <code className="magi-code">.magi-body-lg</code>
          <p className="magi-body-lg">Body large — used for hero subheads and lead paragraphs.</p>
        </div>
        <div className={styles.typeRow}>
          <code className="magi-code">.magi-body</code>
          <p className="magi-body">Body — default paragraph text.</p>
        </div>
        <div className={styles.typeRow}>
          <code className="magi-code">.magi-body-sm</code>
          <p className="magi-body-sm">Body small — supporting copy and metadata.</p>
        </div>
        <div className={styles.typeRow}>
          <code className="magi-code">.magi-label</code>
          <p className="magi-label">Label — for form labels and short emphasis.</p>
        </div>
        <div className={styles.typeRow}>
          <code className="magi-code">.magi-caption</code>
          <p className="magi-caption">Caption — timestamps, fine print.</p>
        </div>
        <div className={styles.typeRow}>
          <code className="magi-code">.magi-eyebrow</code>
          <p className="magi-eyebrow">Eyebrow — kicker label above headlines</p>
        </div>
        <div className={styles.typeRow}>
          <code className="magi-code">.magi-code</code>
          <p>
            Inline code: <code className="magi-code">npm install @magi/design-system</code>
          </p>
        </div>
      </section>
    </article>
  );
}