/**
 * @tokyo3rdhq/magi-design-system — public API.
 *
 *   import '@tokyo3rdhq/magi-design-system/styles.css';
 *   import {
 *     Container, Section, Stack,
 *     Button, Card, Badge,
 *     Checkbox, FormField, Input, Segmented, Banner, EmptyState,
 *     ProductTheme,
 *   } from '@tokyo3rdhq/magi-design-system';
 */

// Side-effect import: bundles tokens + foundation + all component CSS into
// dist/styles.css. The import is a no-op at runtime; it tells Vite to emit
// the CSS bundle so that the package.json "./styles.css" export resolves.
import './styles/index.css';

export * from './layout/index';
export * from './components/Button/index';
export * from './components/Card/index';
export * from './components/Badge/index';
export * from './components/Checkbox/index';
export * from './components/Input/index';
export * from './components/FormField/index';
export * from './components/Segmented/index';
export * from './components/Banner/index';
export * from './components/EmptyState/index';
export { ProductTheme } from './theme';
export type { ProductThemeProps, ProductAccent } from './theme';