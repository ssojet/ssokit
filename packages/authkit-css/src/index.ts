export type ThemePreset = 'light' | 'dark' | 'minimal' | 'enterprise';

export interface ThemeTokens {
  // Colors
  bg?: string;
  bgSubtle?: string;
  bgMuted?: string;
  bgHover?: string;
  bgActive?: string;
  fg?: string;
  fgSubtle?: string;
  fgMuted?: string;
  border?: string;
  borderHover?: string;
  primary?: string;
  primaryHover?: string;
  primaryFg?: string;
  danger?: string;
  dangerHover?: string;
  dangerFg?: string;
  success?: string;
  successFg?: string;
  warning?: string;
  warningFg?: string;
  info?: string;
  infoFg?: string;

  // Layout
  radius?: string;
  radiusSm?: string;
  radiusLg?: string;
  spacing?: string;
  spacingXs?: string;
  spacingSm?: string;
  spacingMd?: string;
  spacingLg?: string;
  spacingXl?: string;

  // Typography
  fontSize?: string;
  fontFamily?: string;
  lineHeight?: string;

  // Shadows
  shadow?: string;
  shadowSm?: string;
  shadowMd?: string;
  shadowLg?: string;

  // Input
  inputH?: string;
  inputHSm?: string;
  inputHLg?: string;

  // Focus
  ring?: string;
  ringDanger?: string;
  ringWidth?: string;
  ringOffset?: string;
}

export type Theme = ThemePreset | ThemeTokens;

/**
 * Apply theme tokens to an element by setting CSS variables
 */
export function applyThemeVars(element: HTMLElement, tokens: ThemeTokens): void {
  Object.entries(tokens).forEach(([key, value]) => {
    if (value !== undefined) {
      // Convert camelCase to kebab-case
      const cssVar = `--ak-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;
      element.style.setProperty(cssVar, String(value));
    }
  });
}

/**
 * Apply a theme preset by adding the appropriate CSS class
 */
export function applyThemePreset(element: HTMLElement, preset: ThemePreset): void {
  // Remove existing theme classes
  element.classList.remove('ak-theme-light', 'ak-theme-dark', 'ak-theme-minimal', 'ak-theme-enterprise');
  
  // Add new theme class
  element.classList.add(`ak-theme-${preset}`);
}

/**
 * Apply a theme (preset or tokens) to an element
 */
export function applyTheme(element: HTMLElement, theme: Theme): void {
  if (typeof theme === 'string') {
    applyThemePreset(element, theme);
  } else {
    applyThemeVars(element, theme);
  }
}

/**
 * Get the default theme from environment or return 'light'
 */
export function getDefaultTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  const themeEnv = (window as any).__AUTHKIT_THEME__;
  if (!themeEnv) return 'light';
  
  if (typeof themeEnv === 'string') {
    return themeEnv as ThemePreset;
  }
  
  return themeEnv as ThemeTokens;
}
