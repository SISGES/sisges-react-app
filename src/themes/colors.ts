export const lightTheme = {
  background: '#FFFFFF',
  surface: '#F1F5F9',
  inputBackground: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  accent: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#16A34A',
} as const

export const darkTheme = {
  background: '#020617',
  surface: '#0F172A',
  inputBackground: '#1E293B',
  border: '#1E293B',
  textPrimary: '#E5E7EB',
  textSecondary: '#CBD5F5',
  textMuted: '#64748B',
  primary: '#3B82F6',
  primaryHover: '#2563EB',
  accent: '#22C55E',
  error: '#F87171',
  warning: '#FBBF24',
  success: '#4ADE80',
} as const

export type Theme = typeof lightTheme | typeof darkTheme
