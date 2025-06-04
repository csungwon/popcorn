import AsyncStorage from '@react-native-async-storage/async-storage'
import { SplashScreen } from 'expo-router'
import {
  Context,
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'

SplashScreen.preventAutoHideAsync()

export interface OnboardingStatusContextType {
  onboardingComplete: boolean | null
  completeOnboarding: () => Promise<void>
}

export const OnboardingStatusContext: Context<OnboardingStatusContextType> =
  createContext<OnboardingStatusContextType>({
    onboardingComplete: null,
    completeOnboarding: () => Promise.resolve()
  })

export function OnboardingStatusProvider({ children }: PropsWithChildren) {
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('@onboardingComplete')
        if (value !== null) {
          setOnboardingComplete(true)
        } else {
          setOnboardingComplete(false)
        }
      } catch (e) {
        // error reading value
        console.error('Error reading onboarding status', e)
        setOnboardingComplete(false) // Assume not complete on error
      }
      setIsLoading(false)
    }

    checkOnboarding()
  }, [])

  // Hide the splash screen once onboarding status is determined
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync()
    }
  }, [isLoading])

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem('@onboardingComplete', 'true')
      setOnboardingComplete(true)
    } catch (e) {
      // error saving value
      console.error('Error saving onboarding status', e)
    }
  }, [])

  return (
    <OnboardingStatusContext value={{ onboardingComplete, completeOnboarding }}>
      {children}
    </OnboardingStatusContext>
  )
}

export function useOnboardingStatus() {
  const context = useContext(OnboardingStatusContext)
  if (!context) {
    throw new Error(
      'useOnboardingStatus must be used within an OnboardingStatusProvider'
    )
  }
  return context
}
