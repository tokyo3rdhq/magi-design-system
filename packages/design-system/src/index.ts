/**
 * @magi/design-system — public API.
 *
 *   import '@magi/design-system/styles.css';
 *   import { Container, Section, Stack, Button, Card, Badge, ProductTheme } from '@magi/design-system';
 */

// Side-effect import: bundles tokens + foundation + all component CSS into
// dist/styles.css. The import is a no-op at runtime; it tells Vite to emit
// the CSS bundle so that the package.json "./styles.css" export resolves.
import './styles/index.css';

export * from './layout/index';
export * from './components/Button/index';
export * from './components/Card/index';
export * from './components/Badge/index';
export { ProductTheme } from './theme';
export type { ProductThemeProps, ProductAccent } from './theme';