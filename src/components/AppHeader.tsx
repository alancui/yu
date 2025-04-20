import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { Text } from './Text';
import { RootStackParamList } from '../types';

type AppHeaderProps = {
  title?: string;
  currentMode: 'voice' | 'text';
};

type AppHeaderNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AppHeader: React.FC<AppHeaderProps> = ({ title, currentMode }) => {
  const { colors } = useTheme();
  const navigation = useNavigation<AppHeaderNavigationProp>();

  const navigateToVoice = () => {
    if (currentMode !== 'voice') {
      navigation.navigate('Voice');
    }
  };

  const navigateToText = () => {
    if (currentMode !== 'text') {
      navigation.navigate('Text', {});
    }
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  const navigateToHistory = () => {
    navigation.navigate('HistoryRecord');
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={styles.leftContainer}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            currentMode === 'voice' && [styles.activeMode, { borderColor: colors.primary }]
          ]}
          onPress={navigateToVoice}
        >
          <Ionicons
            name="mic-outline"
            size={22}
            color={currentMode === 'voice' ? colors.primary : colors.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            currentMode === 'text' && [styles.activeMode, { borderColor: colors.primary }]
          ]}
          onPress={navigateToText}
        >
          <Ionicons
            name="keypad-outline"
            size={22}
            color={currentMode === 'text' ? colors.primary : colors.text}
          />
        </TouchableOpacity>
      </View>
      
      {title && (
        <Text style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
      )}
      
      <View style={styles.rightContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={navigateToHistory}
        >
          <Ionicons name="time-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={navigateToSettings}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeMode: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
}); 