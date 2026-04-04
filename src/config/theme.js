/**
 * Theme Configuration
 * Colors and styling matching the OfflineGPT design
 */

export const COLORS = {
  // Brand Colors (Teal/Green - like ChatGPT style)
  brand: {
    50: '#e6f7f3',
    100: '#ccefe7',
    200: '#99dfcf',
    300: '#66cfb7',
    400: '#33bf9f',
    500: '#10a37f', // Primary brand color (teal)
    600: '#0d8a6a', // Darker teal
    700: '#0a7159',
    800: '#085848',
    900: '#053f37',
  },

  // Logo Gradient Colors
  logoGradient: {
    start: '#4b90ff',  // Blue
    middle: '#8ba4f9', // Light purple
    end: '#ff5546',    // Red/Orange
  },

  // Light Theme
  light: {
    background: '#ffffff',      // Pure white (gray-50 in design)
    surface: '#ffffff',         // White cards
    surfaceSecondary: '#f3f4f6', // gray-100
    text: '#111827',            // Dark text
    textSecondary: '#6b7280',   // gray-500
    textTertiary: '#9ca3af',    // gray-400
    border: '#e5e7eb',          // gray-200
    borderLight: '#f3f4f6',     // gray-100
    icon: '#6b7280',
    iconActive: '#111827',
    // Chat specific
    userBubble: '#e5e7eb',      // gray-200
    aiBubble: 'transparent',
    inputBg: '#ffffff',
  },

  // Dark Theme (Pure black like the design)
  dark: {
    background: '#000000',      // Pure black (gray-900 in design)
    surface: '#1f1f1f',         // Slightly lighter for cards (gray-800)
    surfaceSecondary: '#2d2d35', // gray-750
    text: '#ffffff',            // White text
    textSecondary: '#9ca3af',   // gray-400
    textTertiary: '#6b7280',    // gray-500
    border: '#2d2d35',          // gray-750
    borderLight: '#1f1f1f',     // gray-800
    icon: '#9ca3af',
    iconActive: '#ffffff',
    // Chat specific
    userBubble: '#1f1f1f',      // gray-800
    aiBubble: 'transparent',
    inputBg: '#1f1f1f',
  },

  // Semantic Colors
  success: '#22c55e',
  successLight: '#dcfce7',
  error: '#ef4444',
  errorLight: '#fee2e2',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  info: '#3b82f6',
  infoLight: '#dbeafe',

  // Status Colors
  online: '#22c55e',
  offline: '#ef4444',
  pending: '#f59e0b',

  // Tool Colors (matching the design)
  tools: {
    notes: '#10a37f',      // Brand teal
    planner: '#3b82f6',    // Blue
    money: '#22c55e',      // Green
    fitness: '#f97316',    // Orange
    email: '#06b6d4',      // Cyan
    notifications: '#eab308', // Yellow
    translator: '#ec4899', // Pink
  },

  // Premium/Amber colors (for premium badges)
  amber: {
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    900: '#78350f',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 26,  // For input fields like in design
  full: 9999,
};

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  title: 28,
  hero: 32,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Helper function to get theme colors
export const getThemeColors = (isDark) => {
  return isDark ? COLORS.dark : COLORS.light;
};
