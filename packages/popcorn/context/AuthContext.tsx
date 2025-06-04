import microwaveAxiosInstance from '@/utils/microwaveAxios'
import {
  GoogleSignin,
  isSuccessResponse
} from '@react-native-google-signin/google-signin'
import { SplashScreen, useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { createContext, useContext, useEffect, useState } from 'react'

SplashScreen.preventAutoHideAsync()
GoogleSignin.configure({
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  offlineAccess: false
})

type AuthContextType = {
  accessToken: string | null
  isLoading: boolean
  signIn: (input: LocalSignInInput) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: () => Promise<void>
  signOut: () => Promise<void>
}

type SignInResponse = {
  firstName: string
  lastName: string
  email: string
  token: string
}

type LocalSignInInput = {
  email: string
  password: string
}

const AUTH_STORAGE_KEY = 'auth-access-token'

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  isLoading: true,
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signUp: async () => {},
  signOut: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadAccessToken = async () => {
      try {
        const token = await SecureStore.getItemAsync(AUTH_STORAGE_KEY)
        if (token !== null) {
          setAccessToken(token)
        }
      } catch (error) {
        console.error('Failed to load access token', error)
      }
      setIsLoading(false)
    }

    loadAccessToken()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync()
    }
  }, [isLoading])

  const signIn = async ({ email, password }: LocalSignInInput) => {
    // Implement sign-in logic here
    try {
      const response = await microwaveAxiosInstance.post<SignInResponse>(
        '/api/v1/auth/default',
        { email, password }
      )
      const accessToken = response.data.token
      await SecureStore.setItemAsync(AUTH_STORAGE_KEY, accessToken)
      setAccessToken(accessToken)
      router.replace('/(tabs)/search') // Navigate to the search page after successful sign-in
    } catch (error) {
      console.error('Sign-in failed', error)
      throw error // Re-throw the error to handle it in the UI
    }
  }

  const signInWithGoogle = async () => {
    try {
      const response = await GoogleSignin.signIn()
      if (isSuccessResponse(response)) {
        const googleIdToken = response.data.idToken
        try {
          const googleSignInResponse =
            await microwaveAxiosInstance.post<SignInResponse>(
              '/api/v1/auth/google',
              { token: googleIdToken }
            )
          const accessToken = googleSignInResponse.data.token
          await SecureStore.setItemAsync(AUTH_STORAGE_KEY, accessToken)
          setAccessToken(accessToken)
          router.replace('/(tabs)/search') // Navigate to the search page after successful sign-in
        } catch (error) {
          console.error('Google sign-in failed', error)
        }
      }
    } catch (error) {
      console.error('Google sign-in failed', error)
    }
  }

  const signUp = async () => {
    // Implement sign-up logic here
  }

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY)
      setAccessToken(null)
    } catch (error) {
      console.error('Failed to sign out', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isLoading,
        signIn,
        signInWithGoogle,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
