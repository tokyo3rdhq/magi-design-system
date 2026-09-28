import { useState } from 'react';
import { Container, AppTheme, type AppAccent } from '@tokyo3rdhq/magi-design-system';
import { Tokens } from './pages/Tokens';
import { Typography } from './pages/Typography';
import { Buttons } from './pages/Buttons';
import { Cards } from './pages/Cards';
import { Badges } from './pages/Badges';
import { Layout } from './pages/Layout';
import { Phase4 } from './pages/Phase4';
import { Brand } from './pages/Brand';
import styles from './App.module.css';

type Page =
  | 'tokens'
  | 'typography'
  | 'buttons'
  | 'cards'
  | 'badges'
  | 'layout'
  | 'phase4'
  | 'brand';

const PAGES: { id: Page; label: string }[] = [
  { id: 'tokens', label: 'Tokens' },
  { id: 'typography', label: 'Typography' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'cards', label: 'Cards' },
  { id: 'badges', label: 'Badges' },
  { id: 'layout', label: 'Layout' },
  { id: 'phase4', label: 'Phase 4' },
  { id: 'brand', label: 'Brand' },
];

const ACCENTS: { id: AppAccent; label: string }[] = [
  { id: 'green', label: 'Green (default)' },
  { id: 'cyan', label: 'Cyan' },
  { id: 'violet', label: 'Violet' },
  { id: 'amber', label: 'Amber' },
  { id: 'white', label: 'White' },
];

export function App() {
  const [page, setPage] = useState<Page>('tokens');
  const [accent, setAccent] = useState<AppAccent>('green');

  return (
    <AppTheme accent={accent} name="showroom">
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div className={styles.brand}>
            <span className={styles.brandKicker}>MAGI</span>
            <span className={styles.brandTitle}>Design System</span>
          </div>
          <nav className={styles.nav} aria-label="Primary">
            {PAGES.map((p) => (
              <button
                key={p.id}
                className={page === p.id ? styles.navActive : styles.navItem}
                onClick={() => setPage(p.id)}
              >
                {p.label}
              </button>
            ))}
          </nav>
          <label className={styles.accentPicker}>
            <span className={styles.accentLabel}>Accent</span>
            <select
              value={accent}
              onChange={(e) => setAccent(e.target.value as AppAccent)}
            >
              {ACCENTS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>
        </header>

        <main>
          <Container size="wide">
            {page === 'tokens' && <Tokens />}
            {page === 'typography' && <Typography />}
            {page === 'buttons' && <Buttons />}
            {page === 'cards' && <Cards />}
            {page === 'badges' && <Badges />}
            {page === 'layout' && <Layout />}
            {page === 'phase4' && <Phase4 />}
            {page === 'brand' && <Brand />}
          </Container>
        </main>

        <footer className={styles.footer}>
          <Container size="wide">
            <p className="magi-caption">
              Phase 1 — tokens, foundation, layout primitives, UI primitives.
            </p>
          </Container>
        </footer>
      </div>
    </AppTheme>
  );
}