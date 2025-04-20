import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { Text } from './Text';
import { RootStackParamList } from '../types';

type StatusBarNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  showModeSwitch?: boolean;
  connected?: boolean;
};

export const StatusBar: React.FC<Props> = ({ 
  showModeSwitch = false,
  connected = true,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation<StatusBarNavigationProp>();

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.statusContainer}>
        <View style={styles.connectionStatus}>
          <View style={[
            styles.dot, 
            { backgroundColor: connected ? '#4CAF50' : '#F44336' }
          ]} />
          <Text style={[styles.statusText, { color: colors.secondaryText }]}>
            {connected ? '已连接' : '未连接'}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        {showModeSwitch && (
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Text')}
          >
            <Ionicons name="chatbubble-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statusContainer: {
    flex: 1,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    padding: 8,
    marginLeft: 8,
  },
}); 