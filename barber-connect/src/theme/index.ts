// Theme exports
export const colors = {
  primary: { main: '#000000', light: '#1A1A1A', dark: '#000000', contrast: '#FFFFFF' },
  accent: { gold: '#D4AF37', red: '#DC143C', blue: '#1E90FF', silver: '#C0C0C0' },
  neutral: { 50: '#FAFAFA', 100: '#F5F5F5', 200: '#EEEEEE', 300: '#E0E0E0', 400: '#BDBDBD', 500: '#9E9E9E', 600: '#757575', 700: '#616161', 800: '#424242', 900: '#212121' },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  social: { like: '#FF3B30', comment: '#007AFF', share: '#34C759', bookmark: '#FFD700' },
  background: { primary: '#FFFFFF', secondary: '#F8F9FA', dark: '#121212', card: '#FFFFFF', cardDark: '#1E1E1E' },
  text: { primary: '#000000', secondary: '#6B7280', tertiary: '#9CA3AF', inverse: '#FFFFFF', link: '#3B82F6' },
  border: { light: '#E5E7EB', medium: '#D1D5DB', dark: '#9CA3AF' },
};

export const typography = {
  fonts: { regular: 'System', medium: 'System', semiBold: 'System', bold: 'System' },
  sizes: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48 },
  lineHeights: { tight: 1.2, normal: 1.5, relaxed: 1.75, loose: 2 },
  letterSpacing: { tight: -0.5, normal: 0, wide: 0.5, wider: 1 },
  weights: { regular: '400' as const, medium: '500' as const, semiBold: '600' as const, bold: '700' as const, extraBold: '800' as const },
};

export const textStyles = {
  h1: { fontSize: 36, fontWeight: '700' as const, lineHeight: 43 },
  h2: { fontSize: 30, fontWeight: '700' as const, lineHeight: 36 },
  h3: { fontSize: 24, fontWeight: '600' as const, lineHeight: 36 },
  h4: { fontSize: 20, fontWeight: '600' as const, lineHeight: 30 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyLarge: { fontSize: 18, fontWeight: '400' as const, lineHeight: 32 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 19 },
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 40, '3xl': 48, '4xl': 64, '5xl': 80 };

export const borderRadius = { none: 0, sm: 4, md: 8, lg: 12, xl: 16, '2xl': 24, full: 9999 };

export const shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  xl: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
};

export const lightTheme = { colors, typography, textStyles, spacing, borderRadius, shadows, isDark: false };
export const darkTheme = { ...lightTheme, isDark: true };
export type Theme = typeof lightTheme;
