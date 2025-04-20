import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { VoiceScreen } from './src/screens/VoiceScreen';
import { TextScreen } from './src/screens/TextScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { HistoryRecordScreen } from './src/screens/HistoryRecordScreen';
import { RootStackParamList } from './src/types';
import './src/i18n/config';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { colors, dark } = useTheme();

  return (
    <NavigationContainer>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Navigator
          initialRouteName="Voice"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="Voice" component={VoiceScreen} />
          <Stack.Screen name="Text" component={TextScreen} />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerShown: true,
              title: '设置',
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerTintColor: colors.text,
            }}
          />
          <Stack.Screen
            name="HistoryRecord"
            component={HistoryRecordScreen}
            options={{
              headerShown: true,
              title: '历史记录',
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerTintColor: colors.text,
            }}
          />
          {/* TODO: Add PromptEditor and TargetSystemSettings screens */}
        </Stack.Navigator>
        <StatusBar style={dark ? 'light' : 'dark'} />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
