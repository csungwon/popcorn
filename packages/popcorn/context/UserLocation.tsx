import {
  getCurrentPositionAsync,
  LocationObject,
  requestForegroundPermissionsAsync
} from 'expo-location'
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

interface UserLocationContextType {
  userLocation: LocationObject
  error: string | null
  updateUserLocation: () => void
}

const UserLocationContext: Context<UserLocationContextType | null> =
  createContext<UserLocationContextType | null>(null)

export function UserLocationProvider({ children }: PropsWithChildren) {
  const [userLocation, setUserLocation] = useState<LocationObject | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const updateUserLocation = useCallback(async () => {
    setIsLoading(true)
    const location = await getCurrentPositionAsync({})
    setUserLocation(location)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const getCurrentLocation = async () => {
      const { granted } = await requestForegroundPermissionsAsync()
      if (!granted) {
        console.error('Permission to access location was denied')
        setError('Permission to access location was denied')
        setIsLoading(false)
        return
      }
      await updateUserLocation()
    }
    getCurrentLocation()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync()
    }
  }, [isLoading])


  if (!userLocation) {
    return null
  }

  return (
    <UserLocationContext
      value={{ userLocation, error, updateUserLocation }}
      children={children}
    />
  )
}

export function useUserLocation() {
  const context = useContext(UserLocationContext)
  if (!context) {
    throw new Error(
      'useUserLocation must be used within a UserLocationProvider'
    )
  }
  return context
}
