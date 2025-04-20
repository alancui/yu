import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

type CheckboxOptionProps = {
  value: string;
  label: string;
  description?: string;
  isChecked: boolean;
  onToggle: (value: string, checked: boolean) => void;
};

export const CheckboxOption: React.FC<CheckboxOptionProps> = ({
  value,
  label,
  description,
  isChecked,
  onToggle,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: colors.border }]}
      onPress={() => onToggle(value, !isChecked)}
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
          styles.checkbox,
          {
            borderColor: isChecked ? colors.primary : colors.border,
            backgroundColor: isChecked ? colors.primary : 'transparent',
          },
        ]}
      >
        {isChecked && <Ionicons name="checkmark" size={16} color="#FFF" />}
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
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 