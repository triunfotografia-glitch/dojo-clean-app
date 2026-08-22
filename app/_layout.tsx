import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';

import 'react-native-reanimated';

import { DojoProvider } from '@/components/context/DojoContext';
import { PixProvider } from '@/components/context/PixContext';
import { PresencaProvider } from '@/components/context/PresencaContext';
import { ProfessorProvider } from '@/components/context/ProfessorContext';
import { TreinoProvider } from '@/components/context/TreinoContext';
import { TurmaProvider } from '@/components/context/TurmaContext';
import { PromptProvider } from '@/components/Prompt';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { GlobalBackButton } from '@/components/GlobalBackButton';

export { ErrorBoundary } from 'expo-router';

// 🚨 IMPORTANTE: remover initialRouteName daqui
// o controle agora é pelo app/index.tsx

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <TreinoProvider>
      <PresencaProvider>
        <TurmaProvider>
          <DojoProvider>
            <ProfessorProvider>
              <PixProvider>
                <ThemeProvider value={DarkTheme}>
                  <PromptProvider>
                    <ProtectedRoute>
                      <View style={{ flex: 1 }}>
                        <GlobalBackButton />

                        <Stack screenOptions={{ headerShown: false }}>

                          {/* APP PRINCIPAL */}
                          <Stack.Screen
                            name="(tabs)"
                            options={{
                              headerShown: false,
                            }}
                          />

                          {/* MODAL */}
                          <Stack.Screen
                            name="modal"
                            options={{
                              presentation: 'modal',
                            }}
                          />

                        </Stack>
                      </View>
                    </ProtectedRoute>
                  </PromptProvider>
                </ThemeProvider>
              </PixProvider>
            </ProfessorProvider>
          </DojoProvider>
        </TurmaProvider>
      </PresencaProvider>
    </TreinoProvider>
  );
}