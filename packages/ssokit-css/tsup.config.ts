import { defineConfig } from 'tsup';
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  onSuccess: async () => {
    // Rebuild CSS after each tsup build
    try {
      mkdirSync(join(__dirname, 'dist'), { recursive: true });
      
      const tokensPath = join(__dirname, 'src', 'tokens.css');
      const presetsDir = join(__dirname, 'src', 'presets');
      const outputPath = join(__dirname, 'dist', 'styles.css');
      
      let cssContent = readFileSync(tokensPath, 'utf-8');
      
      const presetFiles = readdirSync(presetsDir).filter(file => file.endsWith('.css'));
      for (const file of presetFiles) {
        cssContent += '\n' + readFileSync(join(presetsDir, file), 'utf-8');
      }
      
      writeFileSync(outputPath, cssContent);
    } catch (error) {
      console.error('Error building CSS:', error);
      throw error;
    }
    return undefined;
  },
});
