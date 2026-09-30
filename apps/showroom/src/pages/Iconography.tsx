import {
  Search,
  Settings,
  Copy,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Menu,
  X,
  MoreHorizontal,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Check,
  Info,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Filter,
  Sun,
  Moon,
  Languages,
} from 'lucide-react';
import { PageHeader } from './index';
import styles from './pages.module.css';

/**
 * Iconography — showroom page that demonstrates the contract defined in
 * packages/design-system/docs/iconography.md.
 *
 * Sections:
 *   - Generic UI icons (Lucide): a representative sample
 *   - Sizes (16 / 18 / 20 / 24)
 *   - Contexts (icon only, icon + text, button, navigation, status)
 *   - Themes + accents (live via the global theme + accent picker)
 *   - Accessibility (decorative, icon + text, icon-only with aria-label)
 *
 * Every icon here is imported from lucide-react. No hand-ported SVGs.
 */

const GENERIC_ICONS = [
  { name: 'Search', Icon: Search },
  { name: 'Settings', Icon: Settings },
  { name: 'Copy', Icon: Copy },
  { name: 'Download', Icon: Download },
  { name: 'Upload', Icon: Upload },
  { name: 'Refresh', Icon: RefreshCw },
  { name: 'ExternalLink', Icon: ExternalLink },
  { name: 'ChevronDown', Icon: ChevronDown },
  { name: 'ChevronRight', Icon: ChevronRight },
  { name: 'ChevronLeft', Icon: ChevronLeft },
  { name: 'ChevronUp', Icon: ChevronUp },
  { name: 'ArrowRight', Icon: ArrowRight },
  { name: 'ArrowLeft', Icon: ArrowLeft },
  { name: 'Menu', Icon: Menu },
  { name: 'X', Icon: X },
  { name: 'MoreHorizontal', Icon: MoreHorizontal },
  { name: 'Eye', Icon: Eye },
  { name: 'EyeOff', Icon: EyeOff },
  { name: 'Plus', Icon: Plus },
  { name: 'Minus', Icon: Minus },
  { name: 'Check', Icon: Check },
  { name: 'Info', Icon: Info },
  { name: 'AlertTriangle', Icon: AlertTriangle },
  { name: 'AlertCircle', Icon: AlertCircle },
  { name: 'HelpCircle', Icon: HelpCircle },
  { name: 'Filter', Icon: Filter },
  { name: 'Sun', Icon: Sun },
  { name: 'Moon', Icon: Moon },
  { name: 'Languages', Icon: Languages },
] as const;

const SIZES = [16, 18, 20, 24] as const;

export function Iconography() {
  return (
    <article>
      <PageHeader
        eyebrow="Iconography"
        title="Icons in MAGI"
        description="Generic icons come from Lucide. Custom icons only when the concept is MAGI-specific. This page is the visual contract surface — see docs/iconography.md for the rules."
      />

      {/* 1. Generic icons — grid of every Lucide icon the showroom uses.
            Lucide controls the geometry; MAGI controls the size + color
            tokens + a11y. */}
      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Generic UI icons (Lucide)
        </h3>
        <p
          className="magi-body-sm"
          style={{
            marginBottom: 'var(--magi-space-4)',
            color: 'var(--magi-text-secondary)',
          }}
        >
          All imported directly from <code className="magi-code">lucide-react</code>.
          No hand-ported SVGs. Color inherits from the surrounding element via
          <code className="magi-code">currentColor</code>.
        </p>
        <div className={styles.iconGrid}>
          {GENERIC_ICONS.map(({ name, Icon }) => (
            <div key={name} className={styles.iconCell}>
              <Icon size={18} aria-hidden="true" />
              <span className="magi-caption" style={{ color: 'var(--magi-text-secondary)' }}>
                {name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Sizes — same icon (Search) at 4 sizes. Verifies stroke
            weight and viewBox geometry are visually consistent. */}
      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Sizes
        </h3>
        <p
          className="magi-body-sm"
          style={{
            marginBottom: 'var(--magi-space-4)',
            color: 'var(--magi-text-secondary)',
          }}
        >
          Four-tier scale: 16 · 18 · 20 · 24. Default inline UI is 18.
          Stroke width stays at Lucide's default 2px regardless of size.
        </p>
        <div className={styles.iconRow}>
          {SIZES.map((size) => (
            <div key={size} className={styles.iconCell} style={{ minWidth: 80 }}>
              <Search size={size} aria-hidden="true" />
              <span className="magi-caption" style={{ color: 'var(--magi-text-secondary)' }}>
                {size}px
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Contexts — icons in real situations: icon-only buttons,
            icon + text, button with leading icon, navigation,
            status (success / warning / error), metadata. */}
      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Contexts
        </h3>

        {/* Icon-only buttons — every button has an aria-label.
              aria-hidden="true" on the icon (decorative). */}
        <h4
          className="magi-label"
          style={{ marginBottom: 'var(--magi-space-2)', color: 'var(--magi-text-secondary)' }}
        >
          Icon-only buttons
        </h4>
        <p
          className="magi-body-sm"
          style={{
            marginBottom: 'var(--magi-space-3)',
            color: 'var(--magi-text-tertiary)',
          }}
        >
          Accessible name is the <code className="magi-code">aria-label</code>;
          not the icon.
        </p>
        <div
          className={styles.inlineDemo}
          role="group"
          aria-label="Icon-only buttons"
        >
          <button type="button" aria-label="Search" className={styles.iconButton}>
            <Search size={16} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Open menu" className={styles.iconButton}>
            <Menu size={20} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Close" className={styles.iconButton}>
            <X size={16} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Back" className={styles.iconButton}>
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" aria-label="More" className={styles.iconButton}>
            <MoreHorizontal size={18} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Switch to light theme" className={styles.iconButton}>
            <Sun size={16} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Switch to dark theme" className={styles.iconButton}>
            <Moon size={16} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Change language" className={styles.iconButton}>
            <Languages size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Icon + text — text is the semantic source. Icon reinforces. */}
        <h4
          className="magi-label"
          style={{
            marginTop: 'var(--magi-space-6)',
            marginBottom: 'var(--magi-space-2)',
            color: 'var(--magi-text-secondary)',
          }}
        >
          Icon + text
        </h4>
        <p
          className="magi-body-sm"
          style={{
            marginBottom: 'var(--magi-space-3)',
            color: 'var(--magi-text-tertiary)',
          }}
        >
          Text is the semantic source. The icon is recognition aid.
        </p>
        <div className={styles.inlineDemo}>
          <a
            href="https://github.com/tokyo3rdhq"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
          >
            <GithubIcon /> GitHub
            <ExternalLink size={12} aria-hidden="true" />
            <span className="sr-only">(opens in new tab)</span>
          </a>
          <a href="/docs" className={styles.linkPlain}>
            <Copy size={14} aria-hidden="true" /> Documentation
          </a>
          <button type="button" className={styles.btnSecondary}>
            <Download size={14} aria-hidden="true" />
            Download
          </button>
          <button type="button" className={styles.btnSecondary}>
            <RefreshCw size={14} aria-hidden="true" />
            Refresh
          </button>
        </div>

        {/* Navigation — chevron indicators on list items. */}
        <h4
          className="magi-label"
          style={{
            marginTop: 'var(--magi-space-6)',
            marginBottom: 'var(--magi-space-2)',
            color: 'var(--magi-text-secondary)',
          }}
        >
          Navigation
        </h4>
        <nav className={styles.navList} aria-label="Example nav">
          <a href="#docs" className={styles.navLink}>
            Documentation
            <ChevronRight size={14} aria-hidden="true" />
          </a>
          <a href="#api" className={styles.navLink}>
            API reference
            <ChevronRight size={14} aria-hidden="true" />
          </a>
          <a href="#status" className={styles.navLink}>
            Status
            <ChevronRight size={14} aria-hidden="true" />
          </a>
        </nav>

        {/* Status icons — paired with text. Color is not the sole
              semantic carrier. */}
        <h4
          className="magi-label"
          style={{
            marginTop: 'var(--magi-space-6)',
            marginBottom: 'var(--magi-space-2)',
            color: 'var(--magi-text-secondary)',
          }}
        >
          Status (paired with text)
        </h4>
        <div className={styles.statusGrid}>
          <div className={styles.statusRow}>
            <Check size={14} aria-hidden="true" className={styles.statusSuccess} />
            <span>Connected</span>
          </div>
          <div className={styles.statusRow}>
            <Info size={14} aria-hidden="true" className={styles.statusInfo} />
            <span>New version available</span>
          </div>
          <div className={styles.statusRow}>
            <AlertTriangle size={14} aria-hidden="true" className={styles.statusWarning} />
            <span>Configuration incomplete</span>
          </div>
          <div className={styles.statusRow}>
            <AlertCircle size={14} aria-hidden="true" className={styles.statusError} />
            <span>Generation failed</span>
          </div>
        </div>

        {/* Metadata — icon next to small metadata text. */}
        <h4
          className="magi-label"
          style={{
            marginTop: 'var(--magi-space-6)',
            marginBottom: 'var(--magi-space-2)',
            color: 'var(--magi-text-secondary)',
          }}
        >
          Metadata
        </h4>
        <div className={styles.metaList}>
          <span className={styles.metaItem}>
            <Filter size={12} aria-hidden="true" />
            12 results
          </span>
          <span className={styles.metaItem}>
            <Eye size={12} aria-hidden="true" />
            1.2k views
          </span>
          <span className={styles.metaItem}>
            <HelpCircle size={12} aria-hidden="true" />
            Learn more
          </span>
        </div>
      </section>

      {/* 4. Accessibility — three patterns side by side.
            (a) decorative, (b) icon + text, (c) icon-only with aria-label. */}
      <section className={styles.section}>
        <h3 className="magi-h4" style={{ marginBottom: 'var(--magi-space-4)' }}>
          Accessibility
        </h3>
        <ul
          className="magi-body-sm"
          style={{
            listStyle: 'disc',
            paddingLeft: 'var(--magi-space-6)',
            color: 'var(--magi-text-secondary)',
          }}
        >
          <li>
            <strong>Decorative icon</strong> next to text:{' '}
            <span className={styles.inlineDemo}>
              <Search size={14} aria-hidden="true" /> Search docs
            </span>
            — the icon has <code className="magi-code">aria-hidden</code>;
            the accessible name comes from the visible text.
          </li>
          <li>
            <strong>Icon + text</strong> (button):{' '}
            <button type="button" className={styles.btnSecondary}>
              <Download size={14} aria-hidden="true" />
              Download
            </button>
            — accessible name is the visible text. No{' '}
            <code className="magi-code">aria-label</code> needed.
          </li>
          <li>
            <strong>Icon-only</strong> button:{' '}
            <button type="button" aria-label="Search" className={styles.iconButton}>
              <Search size={14} aria-hidden="true" />
            </button>
            — accessible name is the{' '}
            <code className="magi-code">aria-label</code>. The icon is
            decorative.
          </li>
        </ul>
      </section>
    </article>
  );
}

/* Local SVG fallback for the GitHub mark — Lucide doesn't ship a
   GitHub icon. This is the only hand-ported SVG on this page and is
   brand-specific (not a generic UI icon). */
function GithubIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55 0-.28-.01-1.01-.02-1.99-3.2.69-3.87-1.54-3.87-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.27-5.24-5.67 0-1.25.45-2.28 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.79 1.18 1.82 1.18 3.07 0 4.41-2.69 5.38-5.25 5.66.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .3.21.66.79.55 4.57-1.52 7.85-5.83 7.85-10.91C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}