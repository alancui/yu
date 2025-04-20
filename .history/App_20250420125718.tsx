import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { VoiceScreen } from './src/screens/VoiceScreen';
import { TextScreen } from './src/screens/TextScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { HistoryRecord } from './src/screens/HistoryRecord';
import { PromptEditor } from './src/screens/PromptEditor';
import { TargetSystemSettings } from './src/screens/TargetSystemSettings';
import { VoicePlaybackSettings } from './src/screens/VoicePlaybackSettings';
import { VoiceRecognitionSettings } from './src/screens/VoiceRecognitionSettings';
import { InteractionModeSettings } from './src/screens/InteractionModeSettings';
import { LanguageSettings } from './src/screens/LanguageSettings';
import { FontSizeSettings } from './src/screens/FontSizeSettings';
import { WidgetSettings } from './src/screens/WidgetSettings';
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
  const { colors, isDark } = useTheme();

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
            component={HistoryRecord}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="PromptEditor"
            component={PromptEditor}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="TargetSystemSettings"
            component={TargetSystemSettings}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="VoicePlaybackSettings"
            component={VoicePlaybackSettings}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="VoiceRecognitionSettings"
            component={VoiceRecognitionSettings}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="InteractionModeSettings"
            component={InteractionModeSettings}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="LanguageSettings"
            component={LanguageSettings}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="FontSizeSettings"
            component={FontSizeSettings}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="WidgetSettings"
            component={WidgetSettings}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
