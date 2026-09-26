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