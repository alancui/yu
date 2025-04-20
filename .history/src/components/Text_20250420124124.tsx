import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export type TextProps = RNTextProps & {
  variant?: 'header' | 'subheader' | 'body' | 'caption';
};

export const Text: React.FC<TextProps> = ({ style, variant = 'body', children, ...props }) => {
  const { colors } = useTheme();
  
  const variantStyle = React.useMemo(() => {
    switch (variant) {
      case 'header':
        return styles.header;
      case 'subheader':
        return styles.subheader;
      case 'caption':
        return styles.caption;
      case 'body':
      default:
        return styles.body;
    }
  }, [variant]);

  return (
    <RNText
      style={[{ color: colors.text }, variantStyle, style]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  body: {
    fontSize: 16,
  },
  caption: {
    fontSize: 14,
    color: '#666',
  },
}); 