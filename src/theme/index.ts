/**
 * Tema visual compartido: colores, espaciados y tipografía.
 * Úsalo en vez de escribir colores o tamaños a mano, para que las pantallas
 * de los 5 bloques se vean como una sola app.
 */

export const colors = {
  primary: '#0B3C7A',
  primaryDark: '#082C5A',
  primarySoft: '#E6F0FB',
  accent: '#F5A524',

  background: '#F5F7FA',
  surface: '#FFFFFF',
  border: '#DCE3EC',

  text: '#12212F',
  textMuted: '#5B6B7C',
  textInverse: '#FFFFFF',

  danger: '#C62828',
  dangerSoft: '#FDECEC',
  success: '#1E8E5A',
  successSoft: '#E7F5EE',
  warning: '#B26A00',
  warningSoft: '#FDF3E2',

  disabled: '#AEBBC8',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
} as const;

export const theme = { colors, spacing, radius, fontSize } as const;

export type Theme = typeof theme;
