import Button from '@/components/Button'
import { useRouter } from 'expo-router'
import { Image, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const popcornImage = require('@/assets/images/onboarding1.png')

export default function SignUpCompleteScreen() {
  const router = useRouter()
  return (
    <SafeAreaView className="bg-white absolute inset-0 px-4 py-5">
      <View className="justify-center h-[400]">
        <Image className="w-full bg-cover" source={popcornImage} />
      </View>
      <View className="px-4 mt-4">
        <View>
          <Text className="font-bold text-3xl ">
            All set! Start posting now.
          </Text>
          <Text className="text-xl text-gray-500 mt-7">
            Support and share with your local community.
          </Text>
        </View>
      </View>
      <View className='mt-auto'>
        <Button
          label="Get Started"
          onPress={async () => {
            router.replace('/search')
          }}
        />
      </View>
    </SafeAreaView>
  )
}
