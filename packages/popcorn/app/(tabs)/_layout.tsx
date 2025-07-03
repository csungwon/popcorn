import { Redirect, Tabs } from 'expo-router'
import React from 'react'
import { Platform } from 'react-native'

import { HapticTab } from '@/components/HapticTab'
import { IconSymbol } from '@/components/ui/IconSymbol'
import TabBarBackground from '@/components/ui/TabBarBackground'
import { Colors } from '@/constants/Colors'
import { useAuth } from '@/context/AuthContext'
import { useOnboardingStatus } from '@/context/OnboardingStatusContext'
import { useColorScheme } from '@/hooks/useColorScheme'

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const { onboardingComplete } = useOnboardingStatus()
  const authState = useAuth()

  // If onboarding status is still loading, return null to avoid rendering the tabs
  if (onboardingComplete === null) {
    return null
  }

  // If auth state is still loading, return null to avoid rendering the tabs
  if (authState.isLoading) {
    return null
  }

  // redirect to onboarding page if onboarding is not complete
  if (!onboardingComplete) {
    return <Redirect href="/onboarding" />
  }

  // redirect to sign-in page if user is not authenticated
  if (!authState.accessToken) {
    return <Redirect href="/signin" />
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute'
          },
          default: {}
        })
      }}
    >
      <Tabs.Screen
        name="(product)"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="magnifyingglass" color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Dev Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="google-signin"
        options={{
          title: 'Sign In',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          )
        }}
      />
    </Tabs>
  )
}
