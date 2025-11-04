import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/config.ts', 'src/errors.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
});
