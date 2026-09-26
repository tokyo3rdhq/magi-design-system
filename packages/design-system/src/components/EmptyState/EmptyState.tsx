import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/classnames';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional bold title above the description (structured mode). */
  title?: string;
  /** Optional description text — used in structured mode. Defaults to children. */
  description?: ReactNode;
  /** Optional primary call-to-action (e.g. a Button or Link). */
  action?: ReactNode;
  /** Body content. Required in simple mode (when no `description`).
   *  In structured mode it is shown only if `description` is not provided. */
  children?: ReactNode;
}

/**
 * EmptyState — centered placeholder for "no data yet" cases.
 *
 * Two patterns:
 *
 * @example Simple (string + inline elements):
 *   <EmptyState>
 *     No models match. Try loosening the constraints — <Link to="/">edit requirements</Link>.
 *   </EmptyState>
 *
 * @example Structured (title + description + action):
 *   <EmptyState
 *     title="Nothing selected"
 *     description="Pick models on the Browse page first."
 *     action={<Button variant="primary">Go to Browse</Button>}
 *   />
 */
export function EmptyState({
  title,
  description,
  action,
  children,
  className,
  ...rest
}: EmptyStateProps) {
  const structured = Boolean(title || description || action);
  const body = description ?? children;

  return (
    <div
      className={cx(
        'magi-empty',
        structured && 'magi-empty--structured',
        className,
      )}
      {...rest}
    >
      {structured ? (
        <>
          {title ? <p className="magi-empty-title">{title}</p> : null}
          {body !== undefined && body !== null ? (
            <p className="magi-empty-description">{body}</p>
          ) : null}
          {action ? <div className="magi-empty-action">{action}</div> : null}
        </>
      ) : (
        children
      )}
    </div>
  );
}