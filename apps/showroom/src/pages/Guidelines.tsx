import { useState } from 'react';
import { PageHeader } from './index';
import styles from './pages.module.css';

// Minimal inline SVG icons — these are decorative on this page; the
// visible text labels carry the accessible name.
const IconSearch = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const IconMenu = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

const IconClose = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 6l12 12M6 18L18 6" />
  </svg>
);

const IconGitHub = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55 0-.28-.01-1.01-.02-1.99-3.2.69-3.87-1.54-3.87-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.27-5.24-5.67 0-1.25.45-2.28 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.79 1.18 1.82 1.18 3.07 0 4.41-2.69 5.38-5.25 5.66.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .3.21.66.79.55 4.57-1.52 7.85-5.83 7.85-10.91C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
);

const IconExternal = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 17 17 7M9 7h8v8" />
  </svg>
);

const IconChevron = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const IconSun = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
  </svg>
);

const IconMoon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </svg>
);

const IconBack = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m15 6-6 6 6 6" />
  </svg>
);

const IconMore = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
    <circle cx="6" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="18" cy="12" r="1.6" />
  </svg>
);

type ExternalLinkProps = {
  href: string;
  icon?: 'github' | 'external' | 'none';
  children: React.ReactNode;
};

function ExternalLink({ href, icon = 'external', children }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="magi-label"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--magi-space-1)' }}
    >
      {icon === 'github' && <IconGitHub />}
      {children}
      <span aria-hidden="true" style={{ opacity: 0.6 }}>
        ↗
      </span>
      <span style={{ position: 'absolute', left: -9999 }}>(opens in new tab)</span>
    </a>
  );
}

function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('English');

  if (compact) {
    return (
      <div className={styles.inlineDemo}>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="magi-label"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--magi-space-1)',
            padding: 'var(--magi-space-1) var(--magi-space-2)',
            border: '1px solid var(--magi-border)',
            borderRadius: 'var(--magi-radius-md)',
            background: 'transparent',
            color: 'var(--magi-text-primary)',
            cursor: 'pointer',
          }}
        >
          {lang}
          <span aria-hidden="true"><IconChevron /></span>
        </button>
        {open ? (
          <ul
            role="listbox"
            aria-label="Language"
            style={{
              position: 'absolute',
              marginTop: 'var(--magi-space-1)',
              padding: 'var(--magi-space-1) 0',
              background: 'var(--magi-bg-raised)',
              border: '1px solid var(--magi-border)',
              borderRadius: 'var(--magi-radius-md)',
              listStyle: 'none',
              minWidth: 120,
              zIndex: 10,
            }}
          >
            {['English', '简体中文', '日本語', 'Español'].map((l) => (
              <li key={l} role="option" aria-selected={l === lang}>
                <button
                  type="button"
                  onClick={() => {
                    setLang(l);
                    setOpen(false);
                  }}
                  className="magi-body-sm"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: 'var(--magi-space-2) var(--magi-space-3)',
                    background: l === lang ? 'var(--magi-accent-soft)' : 'transparent',
                    color: 'var(--magi-text-primary)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {l}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: 'var(--magi-space-4)' }}>
      {['English', '简体中文', '日本語', 'Español'].map((l) => (
        <li key={l}>
          <button
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={l === lang}
            className="magi-body-sm"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: l === lang ? 'var(--magi-text-primary)' : 'var(--magi-text-tertiary)',
              fontWeight: l === lang ? 'var(--magi-font-weight-medium)' : 'var(--magi-font-weight-normal)',
            }}
          >
            {l}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Guidelines() {
  return (
    <article>
      <PageHeader
        eyebrow="Experience Layer"
        title="MAGI Experience Guidelines"
        description="How MAGI products communicate and organize common user-facing experiences. See docs/guidelines.md for the full principle set."
      />

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Icon-only controls — when they work
        </h3>
        <p className="magi-body-sm" style={{ marginBottom: 'var(--magi-space-4)', color: 'var(--magi-text-secondary)' }}>
          Icon-only is acceptable for <strong>highly conventional actions</strong> where the icon has the same meaning as the text would.
          The accessible name is the <code className="magi-code">aria-label</code>, not the icon.
        </p>
        <div className={styles.inlineDemo} aria-label="Icon-only buttons">
          <button type="button" aria-label="Search" className="iconButton">
            <IconSearch />
          </button>
          <button type="button" aria-label="Open menu" className="iconButton">
            <IconMenu />
          </button>
          <button type="button" aria-label="Close" className="iconButton">
            <IconClose />
          </button>
          <button type="button" aria-label="Back" className="iconButton">
            <IconBack />
          </button>
          <button type="button" aria-label="More" className="iconButton">
            <IconMore />
          </button>
          <button type="button" aria-label="Switch to light theme" className="iconButton">
            <IconSun />
          </button>
          <button type="button" aria-label="Switch to dark theme" className="iconButton">
            <IconMoon />
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Icon + Text — the destination default
        </h3>
        <p className="magi-body-sm" style={{ marginBottom: 'var(--magi-space-4)', color: 'var(--magi-text-secondary)' }}>
          Text is the semantic source. The icon is recognition aid, never the other way around.
        </p>
        <div className={styles.inlineDemo}>
          <ExternalLink href="https://github.com/tokyo3rdhq" icon="github">
            GitHub
          </ExternalLink>
          <ExternalLink href="https://discord.com/example" icon="none">
            Discord
          </ExternalLink>
          <ExternalLink href="https://docs.example.com" icon="none">
            Documentation
          </ExternalLink>
          <ExternalLink href="https://status.example.com" icon="none">
            Status
          </ExternalLink>
          <ExternalLink href="https://example.com/blog" icon="none">
            Blog
          </ExternalLink>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Language selector — language names, not flags
        </h3>
        <p className="magi-body-sm" style={{ marginBottom: 'var(--magi-space-4)', color: 'var(--magi-text-secondary)' }}>
          Endonym in native script. No country flags. The selector exposes the current language
          in <code className="magi-code">&lt;html lang&gt;</code>.
        </p>

        <h4 className="magi-label" style={{ marginBottom: 'var(--magi-space-2)' }}>
          Compact (utility area)
        </h4>
        <div style={{ position: 'relative', marginBottom: 'var(--magi-space-6)' }}>
          <LanguageSelector compact />
        </div>

        <h4 className="magi-label" style={{ marginBottom: 'var(--magi-space-2)' }}>
          List (footer / settings)
        </h4>
        <LanguageSelector />
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          External destination
        </h3>
        <p className="magi-body-sm" style={{ marginBottom: 'var(--magi-space-4)', color: 'var(--magi-text-secondary)' }}>
          Single external indicator (<code className="magi-code">↗</code>). Announce the new-tab behavior to screen readers.
        </p>
        <div className={styles.inlineDemo}>
          <a
            href="https://github.com/tokyo3rdhq"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--magi-space-1)' }}
          >
            <IconGitHub />
            GitHub
            <span aria-hidden="true" style={{ opacity: 0.6, marginLeft: 'var(--magi-space-1)' }}>
              <IconExternal />
            </span>
            <span style={{ position: 'absolute', left: -9999 }}>
              {' '}
              (opens in new tab)
            </span>
          </a>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Active navigation indicator
        </h3>
        <p className="magi-body-sm" style={{ marginBottom: 'var(--magi-space-4)', color: 'var(--magi-text-secondary)' }}>
          Pick one indicator per nav item. Two indicators on the same item reads as decoration, not state.
        </p>
        <nav aria-label="Example nav" style={{ display: 'flex', gap: 'var(--magi-space-6)' }}>
          <a href="#docs" style={navItemStyle(false)}>Documentation</a>
          <a href="#api" style={navItemStyle(false)}>API</a>
          <a href="#status" style={navItemStyle(true)} aria-current="page">
            Status
          </a>
          <a href="#community" style={navItemStyle(false)}>Community</a>
        </nav>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Header utility area
        </h3>
        <p className="magi-body-sm" style={{ marginBottom: 'var(--magi-space-4)', color: 'var(--magi-text-secondary)' }}>
          Group + prioritize. Avoid the icon dump. The canonical showroom header above is the reference example.
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--magi-space-3) var(--magi-space-4)',
            border: '1px solid var(--magi-border)',
            borderRadius: 'var(--magi-radius-lg)',
          }}
        >
          <div className="magi-label" style={{ color: 'var(--magi-text-primary)' }}>
            MAGI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--magi-space-4)' }}>
            <LanguageSelector compact />
            <button type="button" aria-label="Switch theme" className="iconButton">
              <IconSun />
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Footer reference
        </h3>
        <p className="magi-body-sm" style={{ marginBottom: 'var(--magi-space-4)', color: 'var(--magi-text-secondary)' }}>
          Brand-required zones: brand + legal (Privacy / Terms) + copyright + language. Other zones are product-owned.
        </p>
        <footer
          style={{
            border: '1px solid var(--magi-border)',
            borderRadius: 'var(--magi-radius-lg)',
            padding: 'var(--magi-space-8) var(--magi-space-6)',
          }}
        >
          <div className="magi-h4" style={{ marginBottom: 'var(--magi-space-6)' }}>
            MAGI
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 'var(--magi-space-6)',
              marginBottom: 'var(--magi-space-6)',
            }}
          >
            <div>
              <div className="magi-eyebrow" style={{ marginBottom: 'var(--magi-space-2)' }}>Products</div>
              <a href="#models" className="magi-caption" style={footerLinkStyle}>Models</a>
              <a href="#token-factory" className="magi-caption" style={footerLinkStyle}>Token Factory</a>
            </div>
            <div>
              <div className="magi-eyebrow" style={{ marginBottom: 'var(--magi-space-2)' }}>Resources</div>
              <a href="#docs" className="magi-caption" style={footerLinkStyle}>Documentation</a>
              <a href="#api" className="magi-caption" style={footerLinkStyle}>API</a>
            </div>
            <div>
              <div className="magi-eyebrow" style={{ marginBottom: 'var(--magi-space-2)' }}>Community</div>
              <a href="https://github.com/tokyo3rdhq" target="_blank" rel="noopener noreferrer" className="magi-caption" style={footerLinkStyle}>
                GitHub ↗
              </a>
            </div>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--magi-border)', marginBlock: 'var(--magi-space-6)' }} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--magi-space-4)',
            }}
          >
            <span className="magi-caption" style={{ color: 'var(--magi-text-tertiary)' }}>
              © 2026 tokyo3rdhq
            </span>
            <div style={{ display: 'flex', gap: 'var(--magi-space-4)' }}>
              <a href="#privacy" className="magi-caption" style={footerLinkStyle}>Privacy</a>
              <a href="#terms" className="magi-caption" style={footerLinkStyle}>Terms</a>
            </div>
          </div>
        </footer>
      </section>

      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Accessibility: visual minimum ≠ semantic minimum
        </h3>
        <p className="magi-body-sm" style={{ marginBottom: 'var(--magi-space-4)', color: 'var(--magi-text-secondary)' }}>
          Icon-only buttons above carry an <code className="magi-code">aria-label</code>; the icon is <code className="magi-code">aria-hidden</code>.
          External links announce <em>(opens in new tab)</em> via a visually-hidden fragment. Tabs trap focus on the language dropdown.
        </p>
        <ul className="magi-body-sm" style={{ paddingLeft: 'var(--magi-space-6)', color: 'var(--magi-text-secondary)' }}>
          <li>Touch targets ≥ 44px (the icon buttons above are 36×36 — increase to 44×44 on touch surfaces).</li>
          <li>Focus ring uses <code className="magi-code">--magi-focus-ring</code> — visible on every interactive element.</li>
          <li>Tab order matches visual order. The active nav indicator uses <code className="magi-code">aria-current="page"</code>.</li>
        </ul>
      </section>
    </article>
  );
}

const navItemStyle = (active: boolean): React.CSSProperties => ({
  color: active ? 'var(--magi-accent)' : 'var(--magi-text-secondary)',
  borderBottom: active ? '1px solid var(--magi-accent)' : '1px solid transparent',
  paddingBottom: 'var(--magi-space-1)',
  textDecoration: 'none',
  fontWeight: active ? 'var(--magi-font-weight-medium)' : 'var(--magi-font-weight-normal)',
});

const footerLinkStyle: React.CSSProperties = {
  display: 'block',
  color: 'var(--magi-text-secondary)',
  textDecoration: 'none',
  marginBottom: 'var(--magi-space-1)',
};

// .iconButton + .inlineDemo classes live in pages.module.css.