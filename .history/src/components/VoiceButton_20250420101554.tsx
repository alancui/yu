import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { useTheme } from '../theme';

interface VoiceButtonProps {
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  volume?: number; // 0-1 范围的音量值
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  onStartRecording,
  onStopRecording,
  isRecording,
  volume = 0,
}) => {
  const { colors } = useTheme();
  const [animation] = useState(new Animated.Value(1));

  // 录音时的呼吸动画
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

  // 音量环的大小动画
  const volumeScale = 1 + volume * 0.3;

  return (
    <View style={styles.container}>
      {/* 音量环 */}
      {isRecording && (
        <Animated.View
          style={[
            styles.volumeRing,
            {
              backgroundColor: colors.primary + '20',
              transform: [{ scale: volumeScale }],
            },
          ]}
        />
      )}
      
      {/* 主按钮 */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [{ scale: animation }],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: isRecording ? colors.error : colors.primary,
            },
          ]}
          onPress={() => {
            if (isRecording) {
              onStopRecording();
            } else {
              onStartRecording();
            }
          }}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.buttonInner,
              {
                backgroundColor: isRecording ? colors.error : colors.primary,
              },
            ]}
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
    width: 200,
    height: 200,
  },
  buttonContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
  button: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonInner: {
    width: isRecording ? 40 : 60,
    height: isRecording ? 40 : 60,
    borderRadius: isRecording ? 8 : 30,
  },
  volumeRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
}); 