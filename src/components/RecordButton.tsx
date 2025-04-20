import React, { useState } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Easing,
  Dimensions,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const { width, height } = Dimensions.get('window');
const buttonSize = Math.min(width, height) * 0.25; // 按钮大小为屏幕较小边的 25%

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
    width: buttonSize,
    height: buttonSize,
    borderRadius: buttonSize / 2,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: buttonSize * 0.5,
    height: buttonSize * 0.5,
    borderRadius: buttonSize * 0.25,
  },
  volumeIndicator: {
    position: 'absolute',
    width: buttonSize * 1.3,
    height: buttonSize * 1.3,
    borderRadius: buttonSize * 0.65,
    borderWidth: 2,
    opacity: 0.3,
  },
}); 