import type { ThemeObject, ThemePreset } from '../types';

export { frescoTheme } from './fresco';
export { spaceTheme } from './space';
export { minimalTheme } from './minimal';
export { a11yTheme } from './a11y';

import { frescoTheme } from './fresco';
import { spaceTheme } from './space';
import { minimalTheme } from './minimal';
import { a11yTheme } from './a11y';

const THEME_MAP: Record<ThemePreset, ThemeObject> = {
  fresco: frescoTheme,
  space: spaceTheme,
  minimal: minimalTheme,
  a11y: a11yTheme,
};

export function resolveTheme(theme?: ThemePreset | ThemeObject): ThemeObject {
  if (!theme) return frescoTheme;
  if (typeof theme === 'string') return THEME_MAP[theme] ?? frescoTheme;
  return theme;
}
