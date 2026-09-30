import type { ReactNode } from 'react';

export interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <header style={{ marginBottom: 'var(--magi-space-12)' }}>
      <p className="magi-eyebrow" style={{ marginBottom: 'var(--magi-space-4)' }}>
        {eyebrow}
      </p>
      <h1 className="magi-h1" style={{ marginBottom: 'var(--magi-space-4)' }}>
        {title}
      </h1>
      {description ? (
        <p className="magi-body-lg" style={{ maxWidth: '720px' }}>
          {description}
        </p>
      ) : null}
      {children}
    </header>
  );
}

// Re-export page components so other modules can import from
// `pages/index` instead of `pages/<PageName>` directly. The page
// files are also exported individually by Vite's dynamic loader.
export { Iconography } from './Iconography';