import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

// Brand color: Teal #10a37f (matching offlinegpt design)
export const lightTheme = {
  primary: '#10a37f',        // Teal (brand)
  primaryLight: '#33bf9f',   // Lighter teal
  primaryDark: '#0d8a6a',    // Darker teal
  secondary: '#3b82f6',      // Blue for accents
  background: '#ffffff',     // Pure white
  backgroundSecondary: '#f3f4f6', // gray-100
  surface: '#f3f4f6',        // gray-100
  surfaceHover: '#e5e7eb',   // gray-200
  text: '#111827',           // gray-900 (near black)
  textSecondary: '#6b7280',  // gray-500
  textMuted: '#9ca3af',      // gray-400
  border: '#e5e7eb',         // gray-200
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  messageBubbleUser: '#e5e7eb',  // gray-200
  messageBubbleAI: 'transparent',
  inputBackground: '#ffffff',
  cardBackground: '#ffffff',
  gradientStart: '#10a37f',  // Teal
  gradientEnd: '#0d8a6a',    // Darker teal
};

export const darkTheme = {
  primary: '#10a37f',        // Teal (brand)
  primaryLight: '#33bf9f',   // Lighter teal
  primaryDark: '#0d8a6a',    // Darker teal
  secondary: '#3b82f6',      // Blue for accents
  background: '#000000',     // Pure black (matching design)
  backgroundSecondary: '#1f1f1f', // gray-800
  surface: '#1f1f1f',        // gray-800
  surfaceHover: '#2d2d35',   // gray-750
  text: '#ffffff',           // Pure white
  textSecondary: '#9ca3af',  // gray-400
  textMuted: '#6b7280',      // gray-500
  border: '#2d2d35',         // gray-750
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  messageBubbleUser: '#1f1f1f',  // gray-800
  messageBubbleAI: 'transparent',
  inputBackground: '#1f1f1f',
  cardBackground: '#1f1f1f',
  gradientStart: '#10a37f',  // Teal
  gradientEnd: '#0d8a6a',    // Darker teal
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
