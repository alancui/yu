export interface Theme {
  isDark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    error: string;
    success: string;
    inputBackground: string;
  };
}

export const lightTheme: Theme = {
  isDark: false,
  colors: {
    primary: '#007AFF',
    background: '#FFFFFF',
    card: '#F5F5F5',
    text: '#000000',
    border: '#E5E5E5',
    notification: '#FF3B30',
    error: '#FF3B30',
    success: '#34C759',
    inputBackground: '#F5F5F5',
  },
};

export const darkTheme: Theme = {
  isDark: true,
  colors: {
    primary: '#0A84FF',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#333333',
    notification: '#FF453A',
    error: '#FF453A',
    success: '#30D158',
    inputBackground: '#1C1C1E',
  },
};

// 主题 Hook
import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
}; 