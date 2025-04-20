import React from 'react';
import { View, StyleSheet, Slider } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../theme/ThemeContext';

type SettingSliderProps = {
  title: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  leftLabel?: string;
  rightLabel?: string;
  valueFormatter?: (value: number) => string;
  onValueChange: (value: number) => void;
};

export const SettingSlider: React.FC<SettingSliderProps> = ({
  title,
  value,
  minimumValue,
  maximumValue,
  step = 1,
  leftLabel,
  rightLabel,
  valueFormatter,
  onValueChange,
}) => {
  const { colors } = useTheme();
  
  const formattedValue = valueFormatter ? valueFormatter(value) : value.toString();

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.value, { color: colors.primary }]}>
          {formattedValue}
        </Text>
      </View>
      
      <View style={styles.sliderContainer}>
        {leftLabel && (
          <Text style={[styles.sliderLabel, { color: colors.secondaryText }]}>
            {leftLabel}
          </Text>
        )}
        
        <Slider
          style={styles.slider}
          value={value}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          step={step}
          onValueChange={onValueChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
        
        {rightLabel && (
          <Text style={[styles.sliderLabel, { color: colors.secondaryText }]}>
            {rightLabel}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
  },
  value: {
    fontSize: 17,
    fontWeight: '500',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    fontSize: 14,
    width: 30,
    textAlign: 'center',
  },
}); 