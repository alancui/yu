import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from './index';
import { Theme } from '../types';

type ThemeContextType = {
  theme: Theme;
  colors: Theme['colors'];
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  colors: lightTheme.colors,
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(colorScheme === 'dark' ? darkTheme : lightTheme);
  
  useEffect(() => {
    // 系统色彩模式变化时自动更新主题
    setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
  }, [colorScheme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme.dark ? lightTheme : darkTheme));
  };

  const setThemeByName = (themeName: 'light' | 'dark') => {
    setTheme(themeName === 'dark' ? darkTheme : lightTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: theme.colors,
        isDark: theme.dark,
        toggleTheme,
        setTheme: setThemeByName,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => useContext(ThemeContext); 