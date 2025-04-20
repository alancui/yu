import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { useTheme } from './src/theme';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import './src/i18n/config';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  return (
    <NavigationContainer>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen 
            name="Home"
            component={HomeScreen}
            options={{ title: t('home.title') }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: t('settings.title') }}
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
