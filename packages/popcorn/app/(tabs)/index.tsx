import { TextInput as RNTextInput, Text, View } from 'react-native'

import Button from '@/components/Button'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import TextInput from '../../components/TextInput'

export default function HomeScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="px-4 py-8 absolute inset-0 bg-white">
      <Text className="text-5xl">Dev Page</Text>
      <View className="flex flex-col gap-4 mt-8">
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
        <View>
          <Text>Custom Text Input</Text>
          <TextInput placeholder='Search with Google' />
          <Text>Native Text Input</Text>
          <RNTextInput className='border border-gray-500 rounded-full py-3 px-5 focus:border-orange-500' placeholder="Search with Google"/>
        </View>
      </View>
    </SafeAreaView>
  )
}
