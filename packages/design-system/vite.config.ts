import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';

/**
 * Rollup plugin: copyBrandAssets
 *
 * Vite's library mode does not emit non-JS assets referenced via
 * `?url` imports — they're inlined into the JS bundle as base64 strings
 * instead. That breaks the "single source of truth" guarantee for
 * brand SVGs (consumers want to use them outside React too: favicon,
 * OG image, README, etc.).
 *
 * This plugin hooks `writeBundle` and copies everything under
 * src/assets/ verbatim into dist/assets/, preserving subpath.
 *
 * The React components in src/brand/ continue to use `?url` imports;
 * Vite inlines those as data URIs in the JS bundle. Consumers can
 * additionally pull the canonical SVG file from the npm package's
 * dist/assets/ for non-React usage.
 */
function copyBrandAssets() {
  const srcDir = resolve(__dirname, 'src/assets');
  const outDir = resolve(__dirname, 'dist/assets');

  function copyRecursive(fromDir, toDir) {
    mkdirSync(toDir, { recursive: true });
    for (const entry of readdirSync(fromDir)) {
      const fromPath = join(fromDir, entry);
      const toPath = join(toDir, entry);
      const stat = statSync(fromPath);
      if (stat.isDirectory()) {
        copyRecursive(fromPath, toPath);
      } else {
        mkdirSync(dirname(toPath), { recursive: true });
        copyFileSync(fromPath, toPath);
      }
    }
  }

  return {
    name: 'copy-brand-assets',
    enforce: 'post',
    writeBundle() {
      copyRecursive(srcDir, outDir);
    },
  };
}

export default defineConfig({
  plugins: [react(), copyBrandAssets()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        entryFileNames: 'index.js',
        assetFileNames: (asset) => {
          if (asset.name && asset.name.endsWith('.css')) return 'styles.css';
          return 'assets/[name][extname]';
        },
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
    emptyOutDir: false,
  },
});