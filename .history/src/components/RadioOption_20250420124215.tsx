import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../theme/ThemeContext';

type RadioOptionProps = {
  value: string;
  label: string;
  description?: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
};

export const RadioOption: React.FC<RadioOptionProps> = ({
  value,
  label,
  description,
  isSelected,
  onSelect,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: colors.border }]}
      onPress={() => onSelect(value)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        {description && (
          <Text style={[styles.description, { color: colors.secondaryText }]}>
            {description}
          </Text>
        )}
      </View>
      
      <View
        style={[
          styles.radioOuter,
          { borderColor: isSelected ? colors.primary : colors.border },
        ]}
      >
        {isSelected && (
          <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 17,
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
}); 