import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from '../components/StatusBar';
import { RecordButton } from '../components/RecordButton';
import { useTheme } from '../theme';

export const VoiceScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);

  // TODO: Implement actual recording logic
  const handleStartRecording = () => {
    setIsRecording(true);
    // Start recording and volume monitoring
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Stop recording and process audio
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar />
      <View style={styles.content}>
        <RecordButton
          isRecording={isRecording}
          volume={volume}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
        />
      </View>
      <TouchableOpacity
        style={[styles.modeSwitch, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('Text')}
      >
        <Ionicons name="keyboard-outline" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeSwitch: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 