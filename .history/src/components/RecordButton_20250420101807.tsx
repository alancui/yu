import React, { useState } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Easing,
} from 'react-native';
import { useTheme } from '../theme';

type Props = {
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording?: boolean;
  volume?: number;
};

export const RecordButton: React.FC<Props> = ({
  onStartRecording,
  onStopRecording,
  isRecording = false,
  volume = 0,
}) => {
  const { colors } = useTheme();
  const [animation] = useState(new Animated.Value(1));

  React.useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      animation.setValue(1);
    }
  }, [isRecording]);

  const volumeSize = Math.min(1.5, 1 + volume * 0.5);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.volumeIndicator,
          {
            borderColor: colors.primary,
            transform: [
              { scale: animation },
            ],
          },
        ]}
      />
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: isRecording ? colors.primary : colors.background,
            borderColor: colors.primary,
          },
        ]}
        onPressIn={onStartRecording}
        onPressOut={onStopRecording}
      >
        <View
          style={[
            styles.innerCircle,
            {
              backgroundColor: isRecording ? colors.background : colors.primary,
              transform: [{ scale: isRecording ? 0.7 : 1 }],
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
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  volumeIndicator: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    opacity: 0.3,
  },
}); 