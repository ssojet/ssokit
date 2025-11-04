import { defineConfig } from 'tsup';
import { execSync } from 'child_process';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  onSuccess: async () => {
    // Rebuild CSS after each tsup build
    execSync('cat src/tokens.css src/presets/*.css > dist/styles.css', { cwd: __dirname });
    return undefined;
  },
});
