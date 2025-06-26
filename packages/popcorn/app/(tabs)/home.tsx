import { Text, View } from 'react-native'

import Button from '@/components/Button'
import { useAuth } from '@/context/AuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  const router = useRouter()
  const { signOut } = useAuth()

  return (
    <SafeAreaView className="px-4 py-8 absolute inset-0 bg-white">
      <Text className="text-5xl">Dev Page</Text>
      <View className="flex flex-col gap-4 mt-8">
        <Button
          type="secondary"
          label="Sign out"
          onPress={signOut}
        />
        <Button
          type="secondary"
          label="Reset onboarding"
          onPress={() => {
            AsyncStorage.clear()
            router.replace('/onboarding')
          }}
        />
        <Button
          type="secondary"
          label="Go to Sign in page"
          onPress={() => {
            router.push('/signin')
          }}
        />
      </View>
    </SafeAreaView>
  )
}
