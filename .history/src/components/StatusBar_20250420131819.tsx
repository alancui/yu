import React from 'react';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useTheme } from '../theme/ThemeContext';

/**
 * 状态栏组件
 * 根据当前主题自动调整状态栏样式
 */
export const StatusBar: React.FC = () => {
  const { isDark } = useTheme();
  
  return <ExpoStatusBar style={isDark ? 'light' : 'dark'} />;
}; 