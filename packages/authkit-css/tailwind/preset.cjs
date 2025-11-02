/**
 * Tailwind CSS preset for SSOJet AuthKit
 * 
 * Usage in tailwind.config.js:
 * 
 * module.exports = {
 *   presets: [require('@ssojet/authkit-css/tailwind/preset.cjs')],
 *   content: [
 *     './node_modules/@ssojet/**\/*.{js,ts,jsx,tsx}',
 *     './app/**\/*.{ts,tsx}'
 *   ]
 * }
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        ak: {
          bg: 'var(--ak-bg)',
          'bg-subtle': 'var(--ak-bg-subtle)',
          'bg-muted': 'var(--ak-bg-muted)',
          'bg-hover': 'var(--ak-bg-hover)',
          'bg-active': 'var(--ak-bg-active)',
          fg: 'var(--ak-fg)',
          'fg-subtle': 'var(--ak-fg-subtle)',
          'fg-muted': 'var(--ak-fg-muted)',
          border: 'var(--ak-border)',
          'border-hover': 'var(--ak-border-hover)',
          primary: 'var(--ak-primary)',
          'primary-hover': 'var(--ak-primary-hover)',
          'primary-fg': 'var(--ak-primary-fg)',
          danger: 'var(--ak-danger)',
          'danger-hover': 'var(--ak-danger-hover)',
          'danger-fg': 'var(--ak-danger-fg)',
          success: 'var(--ak-success)',
          'success-fg': 'var(--ak-success-fg)',
          warning: 'var(--ak-warning)',
          'warning-fg': 'var(--ak-warning-fg)',
          info: 'var(--ak-info)',
          'info-fg': 'var(--ak-info-fg)',
        },
      },
      borderRadius: {
        ak: 'var(--ak-radius)',
        'ak-sm': 'var(--ak-radius-sm)',
        'ak-lg': 'var(--ak-radius-lg)',
        'ak-full': 'var(--ak-radius-full)',
      },
      spacing: {
        ak: 'var(--ak-spacing)',
        'ak-xs': 'var(--ak-spacing-xs)',
        'ak-sm': 'var(--ak-spacing-sm)',
        'ak-md': 'var(--ak-spacing-md)',
        'ak-lg': 'var(--ak-spacing-lg)',
        'ak-xl': 'var(--ak-spacing-xl)',
      },
      boxShadow: {
        ak: 'var(--ak-shadow)',
        'ak-sm': 'var(--ak-shadow-sm)',
        'ak-md': 'var(--ak-shadow-md)',
        'ak-lg': 'var(--ak-shadow-lg)',
      },
      height: {
        'ak-input': 'var(--ak-input-h)',
        'ak-input-sm': 'var(--ak-input-h-sm)',
        'ak-input-lg': 'var(--ak-input-h-lg)',
      },
      fontSize: {
        ak: 'var(--ak-font-size)',
      },
      fontFamily: {
        ak: 'var(--ak-font-family)',
      },
      ringWidth: {
        ak: 'var(--ak-ring-width)',
      },
      ringOffsetWidth: {
        ak: 'var(--ak-ring-offset)',
      },
    },
  },
  plugins: [],
};
