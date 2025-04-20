import { Theme } from '../types';

export const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#007AFF',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000000',
    secondaryText: '#666666',
    border: '#E5E5E5',
    inputBackground: '#F5F5F5',
    error: '#FF3B30',
  },
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#0A84FF',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    secondaryText: '#999999',
    border: '#333333',
    inputBackground: '#1C1C1E',
    error: '#FF453A',
  },
}; 