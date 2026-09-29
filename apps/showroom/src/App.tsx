import { useState } from 'react';
import {
  Container,
  AppTheme,
  type AppAccent,
  type AppThemeName,
} from '@tokyo3rdhq/magi-design-system';
import { Tokens } from './pages/Tokens';
import { Typography } from './pages/Typography';
import { Buttons } from './pages/Buttons';
import { Cards } from './pages/Cards';
import { Badges } from './pages/Badges';
import { Layout } from './pages/Layout';
import { Phase4 } from './pages/Phase4';
import { Brand } from './pages/Brand';
import { Guidelines } from './pages/Guidelines';
import { Matrix } from './pages/Matrix';
import styles from './App.module.css';

type Page =
  | 'tokens'
  | 'typography'
  | 'buttons'
  | 'cards'
  | 'badges'
  | 'layout'
  | 'phase4'
  | 'brand'
  | 'guidelines'
  | 'matrix';

const PAGES: { id: Page; label: string }[] = [
  { id: 'tokens', label: 'Tokens' },
  { id: 'typography', label: 'Typography' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'cards', label: 'Cards' },
  { id: 'badges', label: 'Badges' },
  { id: 'layout', label: 'Layout' },
  { id: 'phase4', label: 'Phase 4' },
  { id: 'brand', label: 'Brand' },
  { id: 'guidelines', label: 'Guidelines' },
  { id: 'matrix', label: 'Matrix' },
];

const ACCENTS: { id: AppAccent; label: string }[] = [
  { id: 'green', label: 'Green (default)' },
  { id: 'cyan', label: 'Cyan' },
  { id: 'violet', label: 'Violet' },
  { id: 'amber', label: 'Amber' },
  { id: 'white', label: 'White' },
];

const THEMES: { id: AppThemeName; label: string }[] = [
  { id: 'dark', label: 'Dark (canonical)' },
  { id: 'light', label: 'Light' },
];

export function App() {
  const [page, setPage] = useState<Page>('tokens');
  const [accent, setAccent] = useState<AppAccent>('green');
  const [theme, setTheme] = useState<AppThemeName>('dark');
  const [screenshotMode, setScreenshotMode] = useState(false);

  return (
    <AppTheme accent={accent} theme={theme} name="showroom">
      <div className={styles.shell} data-screenshot-mode={screenshotMode ? 'true' : undefined}>
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
          <div style={{ display: 'flex', gap: 'var(--magi-space-4)', alignItems: 'center' }}>
            <label
              className={styles.accentPicker}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--magi-space-1)' }}
            >
              <input
                type="checkbox"
                checked={screenshotMode}
                onChange={(e) => setScreenshotMode(e.target.checked)}
                data-screenshot-toggle
              />
              <span className={styles.accentLabel}>Screenshot mode</span>
            </label>
            <label className={styles.accentPicker}>
              <span className={styles.accentLabel}>Theme</span>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as AppThemeName)}
              >
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
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
          </div>
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
            {page === 'guidelines' && <Guidelines />}
            {page === 'matrix' && <Matrix />}
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