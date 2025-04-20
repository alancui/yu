import React from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { useTheme } from '../theme';

interface RecordButtonProps {
  isRecording: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
}

export const RecordButton: React.FC<RecordButtonProps> = ({
  isRecording,
  onPressIn,
  onPressOut,
}) => {
  const { colors } = useTheme();
  const [animation] = React.useState(new Animated.Value(1));

  React.useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      animation.setValue(1);
    }
  }, [isRecording]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.ripple,
          {
            backgroundColor: colors.primary,
            transform: [{ scale: animation }],
            opacity: isRecording ? 0.2 : 0,
          },
        ]}
      />
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.button,
          {
            backgroundColor: isRecording ? colors.error : colors.primary,
          },
        ]}
      >
        <View
          style={[
            styles.innerCircle,
            {
              backgroundColor: isRecording ? colors.error : colors.primary,
            },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  innerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
  },
}); 