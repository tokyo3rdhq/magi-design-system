import { Badge } from '@magi/design-system';
import { PageHeader } from './index';
import styles from './pages.module.css';

export function Badges() {
  return (
    <article>
      <PageHeader
        eyebrow="Components"
        title="Badge"
        description="Compact status / metadata label. Five variants."
      />

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Variants
        </h3>
        <div className={styles.row}>
          <Badge variant="neutral">neutral</Badge>
          <Badge variant="accent">accent</Badge>
          <Badge variant="success" dot>live</Badge>
          <Badge variant="warning" dot>limited</Badge>
          <Badge variant="error" dot>offline</Badge>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          In context
        </h3>
        <div className={styles.row} style={{ gap: 'var(--magi-space-3)' }}>
          <Badge variant="accent">128K context</Badge>
          <Badge variant="neutral">function calling</Badge>
          <Badge variant="success" dot>free tier</Badge>
        </div>
      </section>
    </article>
  );
}