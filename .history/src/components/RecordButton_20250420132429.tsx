import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

type RecordButtonProps = {
  isRecording: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export const RecordButton: React.FC<RecordButtonProps> = ({ 
  isRecording, 
  onPress,
  disabled = false 
}) => {
  const { colors } = useTheme();
  const [pulseAnim] = React.useState(new Animated.Value(1));
  
  React.useEffect(() => {
    let animation: Animated.CompositeAnimation;
    
    if (isRecording) {
      // 创建脉冲动画
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      
      animation.start();
    } else {
      // 重置动画
      pulseAnim.setValue(1);
    }
    
    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isRecording, pulseAnim]);
  
  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.outerCircle,
          {
            borderColor: isRecording ? colors.error : colors.primary,
            transform: [{ scale: isRecording ? pulseAnim : 1 }],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: isRecording ? colors.error : colors.primary,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
          onPress={onPress}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isRecording ? 'square' : 'mic'}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 