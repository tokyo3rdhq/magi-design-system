import { Container, Section, Stack } from '@tokyo3rdhq/magi-design-system';
import { PageHeader } from './index';
import styles from './pages.module.css';

export function Layout() {
  return (
    <article>
      <PageHeader
        eyebrow="Primitives"
        title="Layout"
        description="Three primitives that capture the page rhythm: Container, Section, Stack."
      />

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Container sizes
        </h3>
        <p className="magi-body-sm" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Each bar below is the same Container at a different size.
        </p>
        {(['sm', 'md', 'lg', 'xl', 'wide'] as const).map((s) => (
          <Container key={s} size={s} className={styles.containerDemo}>
            <code className="magi-code">size=&quot;{s}&quot;</code>
          </Container>
        ))}
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Section spacing
        </h3>
        {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
          <Section key={s} spacing={s} surface="raised">
            <Container size="lg">
              <code className="magi-code">spacing=&quot;{s}&quot;</code>
              <p className="magi-caption" style={{ marginTop: 'var(--magi-space-2)' }}>
                This is a section with {s} spacing and a raised surface.
              </p>
            </Container>
          </Section>
        ))}
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Stack — vertical
        </h3>
        <Stack gap="3">
          <div className={styles.stackItem}>Item 1</div>
          <div className={styles.stackItem}>Item 2</div>
          <div className={styles.stackItem}>Item 3</div>
        </Stack>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Stack — horizontal
        </h3>
        <Stack direction="row" gap="4" align="center">
          <div className={styles.stackItem}>A</div>
          <div className={styles.stackItem}>B</div>
          <div className={styles.stackItem}>C</div>
        </Stack>
      </section>
    </article>
  );
}