import { useState } from 'react';
import { Button } from '@tokyo3rdhq/magi-design-system';
import { PageHeader } from './index';
import styles from './pages.module.css';

export function Buttons() {
  const [loading, setLoading] = useState(false);

  return (
    <article>
      <PageHeader
        eyebrow="Components"
        title="Button"
        description="Four variants, three sizes. Supports hover, active, focus-visible, disabled, and loading states."
      />

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Variants
        </h3>
        <div className={styles.row}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Sizes
        </h3>
        <div className={styles.row} style={{ alignItems: 'center' }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          States
        </h3>
        <div className={styles.row} style={{ alignItems: 'center' }}>
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
          <Button loading={loading} onClick={() => setLoading(true)}>
            {loading ? 'Submitting…' : 'Submit (loading demo)'}
          </Button>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Focus ring
        </h3>
        <p className="magi-body-sm" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Tab to a button to see the focus ring (uses --magi-accent).
        </p>
        <div className={styles.row}>
          <Button variant="primary">Tab me</Button>
        </div>
      </section>
    </article>
  );
}