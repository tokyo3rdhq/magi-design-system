import { Card, Badge } from '@magi/design-system';
import { PageHeader } from './index';
import styles from './pages.module.css';

export function Cards() {
  return (
    <article>
      <PageHeader
        eyebrow="Components"
        title="Card"
        description="Minimal dark surfaces with subtle borders. Three variants."
      />

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Variants
        </h3>
        <div className={styles.cardGrid}>
          <Card variant="default">
            <Badge variant="neutral">Default</Badge>
            <h4 className="magi-h4" style={{ marginTop: 'var(--magi-space-4)' }}>
              Default card
            </h4>
            <p className="magi-body-sm" style={{ marginTop: 'var(--magi-space-2)' }}>
              Flat surface with a 1px border. Use for product cards and feature tiles.
            </p>
          </Card>
          <Card variant="elevated">
            <Badge variant="accent">Elevated</Badge>
            <h4 className="magi-h4" style={{ marginTop: 'var(--magi-space-4)' }}>
              Elevated card
            </h4>
            <p className="magi-body-sm" style={{ marginTop: 'var(--magi-space-2)' }}>
              Higher contrast for the dominant panel on a page.
            </p>
          </Card>
          <Card variant="interactive">
            <Badge variant="success">Interactive</Badge>
            <h4 className="magi-h4" style={{ marginTop: 'var(--magi-space-4)' }}>
              Hover me
            </h4>
            <p className="magi-body-sm" style={{ marginTop: 'var(--magi-space-2)' }}>
              Adds hover state with border lift and surface darken.
            </p>
          </Card>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Padding
        </h3>
        <div className={styles.cardGrid}>
          <Card padding="sm">
            <span className="magi-caption">padding=sm</span>
          </Card>
          <Card padding="md">
            <span className="magi-caption">padding=md (default)</span>
          </Card>
          <Card padding="lg">
            <span className="magi-caption">padding=lg</span>
          </Card>
        </div>
      </section>
    </article>
  );
}