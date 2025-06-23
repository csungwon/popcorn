import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import '../global.css'

import { AuthProvider } from '@/context/AuthContext'
import { OnboardingStatusProvider } from '@/context/OnboardingStatusContext'
import { useColorScheme } from '@/hooks/useColorScheme'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import 'expo-dev-client'
import { Image } from 'expo-image'
import { cssInterop } from 'react-native-css-interop'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

// allow tailwindcss for Image component
cssInterop(Image, { className: 'style' })

const queryClient = new QueryClient()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
  })

  if (!loaded) {
    // Async font loading only occurs in development.
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <SafeAreaProvider>
            <OnboardingStatusProvider>
              <GestureHandlerRootView>
                <Stack screenOptions={{ headerShown: false}}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen
                    name="onboarding"
                    options={{ headerShown: false, animation: 'none' }}
                  />
                  <Stack.Screen name="signin" />
                  <Stack.Screen name="signup" />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </GestureHandlerRootView>
            </OnboardingStatusProvider>
          </SafeAreaProvider>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
