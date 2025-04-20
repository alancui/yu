import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, PanResponder, PanResponderInstance } from 'react-native';
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
  const [sliderWidth, setSliderWidth] = useState(0);
  
  const formattedValue = valueFormatter ? valueFormatter(value) : value.toString();
  
  const percentage = (value - minimumValue) / (maximumValue - minimumValue);
  
  const panResponder: PanResponderInstance = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {},
        onPanResponderMove: (_, gestureState) => {
          let newPercentage = gestureState.moveX / sliderWidth;
          newPercentage = Math.max(0, Math.min(1, newPercentage));
          
          let newValue = minimumValue + newPercentage * (maximumValue - minimumValue);
          
          if (step) {
            newValue = Math.round(newValue / step) * step;
          }
          
          onValueChange(newValue);
        },
        onPanResponderRelease: () => {},
      }),
    [minimumValue, maximumValue, sliderWidth, step, onValueChange]
  );

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
        
        <View
          style={styles.sliderTrack}
          onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
          {...panResponder.panHandlers}
        >
          <View
            style={[
              styles.sliderFill,
              {
                backgroundColor: colors.primary,
                width: `${percentage * 100}%`,
              },
            ]}
          />
          <View
            style={[
              styles.sliderThumb,
              {
                backgroundColor: colors.primary,
                left: `${percentage * 100}%`,
                transform: [{ translateX: -10 }], // 调整拇指位置，使其居中
              },
            ]}
          />
        </View>
        
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
    height: 40,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    justifyContent: 'center',
  },
  sliderFill: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    left: 0,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sliderLabel: {
    fontSize: 14,
    width: 30,
    textAlign: 'center',
  },
}); 