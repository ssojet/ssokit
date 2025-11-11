import { defineConfig } from 'tsup';
import { copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';

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
  onSuccess: async () => {
    try {
      mkdirSync(join(__dirname, 'dist'), { recursive: true });
      copyFileSync(
        join(__dirname, 'src', 'styles.css'),
        join(__dirname, 'dist', 'styles.css')
      );
    } catch (error) {
      console.error('Error copying CSS:', error);
      throw error;
    }
    return undefined;
  },
});
