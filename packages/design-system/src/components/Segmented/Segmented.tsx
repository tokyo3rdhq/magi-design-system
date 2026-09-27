import {
  useCallback,
  useRef,
  type ReactNode,
  type KeyboardEvent,
} from 'react';
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
 * **Single-select only.** For multi-select (e.g. provider toggles, multi-tag
 * pickers), use a `Checkbox` group instead — a multi-item segmented control
 * implies exclusive selection and confuses the interaction model.
 *
 * Keyboard navigation (WAI-ARIA Authoring Practices for radio group):
 *   - `ArrowRight` / `ArrowDown`: select + focus next enabled option (wraps)
 *   - `ArrowLeft` / `ArrowUp`: select + focus previous enabled option (wraps)
 *   - `Home`: select + focus first enabled option
 *   - `End`: select + focus last enabled option
 *   - `Space`: select the focused option (browser default for `<button>`)
 *
 * Roving tabindex: only the currently-selected option is in the tab order
 * (`tabIndex={0}`). Other options have `tabIndex={-1}` and are reachable only
 * via the arrow keys above.
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
 *   <Segmented value={cost} options={...} onChange={...} accent />
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
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const key = e.key;
      if (
        key !== 'ArrowRight' &&
        key !== 'ArrowLeft' &&
        key !== 'ArrowDown' &&
        key !== 'ArrowUp' &&
        key !== 'Home' &&
        key !== 'End'
      ) {
        return;
      }
      e.preventDefault();

      // Indices of non-disabled options, in order.
      const enabledIndices = options
        .map((opt, i) => (opt.disabled ? -1 : i))
        .filter((i): i is number => i !== -1);
      if (enabledIndices.length === 0) return;

      const currentIndex = options.findIndex((opt) => opt.value === value);

      let nextIndex: number;
      if (key === 'Home') {
        nextIndex = enabledIndices[0]!;
      } else if (key === 'End') {
        nextIndex = enabledIndices[enabledIndices.length - 1]!;
      } else {
        const posInEnabled =
          currentIndex >= 0 ? enabledIndices.indexOf(currentIndex) : -1;
        const len = enabledIndices.length;
        const step = key === 'ArrowRight' || key === 'ArrowDown' ? 1 : -1;
        const nextPosInEnabled = posInEnabled < 0
          ? (step > 0 ? 0 : len - 1)
          : (posInEnabled + step + len) % len;
        nextIndex = enabledIndices[nextPosInEnabled]!;
      }

      if (nextIndex === currentIndex) return;
      const next = options[nextIndex];
      if (!next) return;

      onChange(next.value);
      // Focus the newly selected button after React commits the state change.
      // requestAnimationFrame is reliable across React 18+ concurrent rendering.
      requestAnimationFrame(() => {
        buttonRefs.current[nextIndex]?.focus();
      });
    },
    [options, value, onChange],
  );

  return (
    <div
      role="radiogroup"
      id={id}
      aria-label={ariaLabel}
      onKeyDown={disabled ? undefined : handleKeyDown}
      className={cx(
        'magi-segmented',
        `magi-segmented--${size}`,
        disabled && 'magi-segmented--disabled',
        className,
      )}
    >
      {options.map((opt, index) => {
        const active = opt.value === value;
        const isDisabled = disabled || opt.disabled;
        const onSelect = () => {
          if (isDisabled || active) return;
          onChange(opt.value);
        };

        if (children) {
          return (
            <div key={opt.value}>
              {children(opt, { active, disabled: !!isDisabled, onSelect })}
            </div>
          );
        }

        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={!!isDisabled}
            tabIndex={active ? 0 : -1}
            onClick={onSelect}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
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