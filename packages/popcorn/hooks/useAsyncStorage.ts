import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useState } from 'react'

export default function useAsyncStorage(key: string) {
  const [value, setValue] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchItem() {
      try {
        const result = await AsyncStorage.getItem(key)
        setValue(result)
      } catch {
        console.error(`failed to fetch key '${key}' from the AsyncStorage.`)
         setValue('')
      } finally {
        setIsLoading(false)
      }
    }
    fetchItem()
  }, [key])

  const setItem = useCallback(async (value: string) => {
    setIsLoading(true)
    try {
      await AsyncStorage.setItem(key, value)
      setValue(value)
    } catch {
      console.error(`failed to set key '${key}' to the AsyncStorage.`)
    } finally {
      setIsLoading(false)
    }
  }, [key])
  return { value, isLoading, setItem }
}