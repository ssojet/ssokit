import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  loader: {
    '.css': 'css',
  },
  banner: {
    js: `'use client';`,
  },
  // Copy CSS files to dist
  onSuccess: 'cp src/styles.css dist/',
});
