import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from './Text';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

type HeaderBarProps = {
  title: string;
  rightComponent?: React.ReactNode;
};

export const HeaderBar: React.FC<HeaderBarProps> = ({ title, rightComponent }) => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.card }]}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={28} color={colors.primary} />
        <Text style={{ color: colors.primary }}>返回</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>{title}</Text>
      
      {rightComponent ? (
        <View style={styles.rightComponent}>
          {rightComponent}
        </View>
      ) : <View style={styles.placeholder} />}
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
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: -1,
  },
  rightComponent: {
    minWidth: 50,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 50,
  }
}); 