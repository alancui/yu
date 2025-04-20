import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../theme/ThemeContext';

type SettingBlockProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
};

export const SettingBlock: React.FC<SettingBlockProps> = ({
  title,
  description,
  children,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {title && (
        <Text style={[styles.title, { color: colors.secondaryText }]}>
          {title}
        </Text>
      )}
      
      <View style={[styles.content, { backgroundColor: colors.card }]}>
        {children}
      </View>
      
      {description && (
        <Text style={[styles.description, { color: colors.secondaryText }]}>
          {description}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 16,
  },
  content: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  description: {
    fontSize: 13,
    marginTop: 8,
    marginLeft: 16,
    marginRight: 16,
  },
}); 