# @ssojet/authkit-css

CSS tokens, theme presets, and Tailwind configuration for SSOJet AuthKit.

## Features

- **CSS custom properties** for complete UI theming
- **Four built-in presets**: light, dark, minimal, enterprise
- **Tailwind preset** for utility-first styling
- **Type-safe theme tokens** with TypeScript

## Installation

```bash
pnpm add @ssojet/authkit-css
```

## Usage

### Import CSS

```typescript
import '@ssojet/authkit-css/styles.css';
```

### Apply Theme via Class

```tsx
<div className="ak-root ak-theme-dark">
  {/* Your AuthKit widgets */}
</div>
```

### Apply Theme via JavaScript

```typescript
import { applyTheme } from '@ssojet/authkit-css';

const element = document.querySelector('.ak-root');
applyTheme(element, 'dark');

// Or with custom tokens
applyTheme(element, {
  primary: '#2563eb',
  radius: '12px',
  fontSize: '16px',
});
```

### Tailwind Integration

```javascript
// tailwind.config.js
module.exports = {
  presets: [require('@ssojet/authkit-css/tailwind/preset.cjs')],
  content: [
    './node_modules/@ssojet/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{ts,tsx}',
  ],
};
```

Then use Tailwind utilities:

```tsx
<button className="bg-ak-primary text-ak-primary-fg rounded-ak h-ak-input">
  Click me
</button>
```

## Theme Presets

### Light (default)
Clean, bright interface with subtle shadows.

### Dark
High-contrast dark mode optimized for low-light environments.

### Minimal
Flat design with minimal shadows and borders.

### Enterprise
Professional, polished look with refined typography.

## Customization

Override any CSS variable:

```css
.ak-root {
  --ak-primary: #8b5cf6;
  --ak-radius: 16px;
  --ak-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
```

## Available CSS Variables

**Colors:** `--ak-bg`, `--ak-fg`, `--ak-primary`, `--ak-danger`, `--ak-success`, `--ak-warning`, `--ak-info`, `--ak-border`

**Layout:** `--ak-radius`, `--ak-spacing`, `--ak-shadow`

**Typography:** `--ak-font-size`, `--ak-font-family`, `--ak-line-height`

**Input:** `--ak-input-h`

**Focus:** `--ak-ring`

See `src/tokens.css` for the complete list.

## License

MIT
