import type { ReactNode } from 'react';
import { cx } from '../../utils/classnames';

export type SegmentedSize = 'sm' | 'md' | 'lg';

export interface SegmentedOption<V extends string = string> {
  value: V;
  label: string;
  /** Optional: disable this individual option. */
  disabled?: boolean;
}

export interface SegmentedProps<V extends string = string> {
  /** Currently selected option value. */
  value: V;
  /** Options to display. */
  options: SegmentedOption<V>[];
  /** Called when the user picks a different option. */
  onChange: (value: V) => void;
  /** Use accent color for the active state (cyan for tfi, etc.). Default: false. */
  accent?: boolean;
  /** Visual size. Default: `md`. */
  size?: SegmentedSize;
  /** Disable the whole control. */
  disabled?: boolean;
  /** Group label for screen readers. */
  'aria-label'?: string;
  /** Optional id for the group. */
  id?: string;
  /** Extra className for the wrapper. */
  className?: string;
  /** Render-prop variant — render function receives each option and its state. */
  children?: (option: SegmentedOption<V>, state: {
    active: boolean;
    disabled: boolean;
    onSelect: () => void;
  }) => ReactNode;
}

/**
 * Segmented — pill-shaped single-select chip group.
 *
 * **SINGLE-SELECT ONLY.** For multi-select (e.g. provider toggles, multi-tag
 * pickers), use a `Checkbox` group instead — a multi-item segmented control
 * implies exclusive selection and confuses the interaction model.
 *
 * @example
 *   <Segmented
 *     value={contextMin}
 *     options={[
 *       { value: '128k', label: '128K+' },
 *       { value: '32k', label: '32K+' },
 *       { value: '8k', label: '8K+' },
 *       { value: 'any', label: 'Any' },
 *     ]}
 *     onChange={(v) => setContextMin(v as ContextMin)}
 *   />
 *
 *   <Segmented value={cost} options={[...] onChange={...} accent />
 */
export function Segmented<V extends string = string>({
  value,
  options,
  onChange,
  accent = false,
  size = 'md',
  disabled = false,
  id,
  className,
  'aria-label': ariaLabel,
  children,
}: SegmentedProps<V>) {
  return (
    <div
      role="radiogroup"
      id={id}
      aria-label={ariaLabel}
      className={cx(
        'magi-segmented',
        `magi-segmented--${size}`,
        disabled && 'magi-segmented--disabled',
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const isDisabled = !!(disabled || opt.disabled);
        const onSelect = () => {
          if (isDisabled || active) return;
          onChange(opt.value);
        };

        if (children) {
          return (
            <div key={opt.value}>
              {children(opt, { active, disabled: isDisabled, onSelect })}
            </div>
          );
        }

        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={isDisabled}
            onClick={onSelect}
            className={cx(
              'magi-segmented-item',
              active && 'magi-segmented-item--active',
              accent && 'magi-segmented-item--accent',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}