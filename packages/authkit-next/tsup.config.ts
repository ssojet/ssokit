import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/routes/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['next'],
  treeshake: true,
});
