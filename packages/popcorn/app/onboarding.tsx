import { useOnboardingStatus } from '@/context/OnboardingStatusContext'
import clsx from 'clsx'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const pages = [
  {
    image: require('@/assets/images/onboarding1.png'),
    title: 'Hey there!\nWe are PopCorn',
    subtitle: 'Ready to pop some great deals?'
  },
  {
    image: require('@/assets/images/onboarding2.png'),
    title: 'Share prices and connect with fellow shoppers',
    subtitle: 'The more you share, the more we all save!'
  },
  {
    image: require('@/assets/images/onboarding3.png'),
    title: 'Other users will love your deals and send you 🧡',
    subtitle: 'Get recognized as a trusted deal finder!'
  }
]

const DEVICE_WIDTH = Dimensions.get('window').width
const DEVICE_HEIGHT = Dimensions.get('window').height

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets()
  const [currentPage, setCurrentPage] = useState(0)
  const router = useRouter()
  const { completeOnboarding } = useOnboardingStatus()

  return (
    <View className="bg-white w-full h-full"><SafeAreaView>
      <FlatList
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={({ viewableItems }) => {
          const currentIndex = viewableItems[0]?.index || 0
          setCurrentPage(currentIndex)
        }}
        renderItem={({ item }) => (
          <View
            style={{
              width: DEVICE_WIDTH,
              height: DEVICE_HEIGHT - insets.top - insets.bottom - 24
            }}
          >
            <View className="justify-center h-[400]">
              <Image className="w-full bg-cover" source={item.image} />
            </View>
            <View className="px-4 mt-4">
              <View>
                <Text className="font-bold text-3xl ">{item.title}</Text>
                <Text className="text-xl text-gray-500 mt-2">
                  {item.subtitle}
                </Text>
              </View>
            </View>
          </View>
        )}
        keyExtractor={(_, index) => index.toString()}
      />
      <View className="absolute bottom-5 left-4 right-4 items-center">
        {/* Onboarding Step Indicator */}
        <View className="flex-row gap-2.5 mb-3">
          {pages.map((_, index) => {
            return (
              <View
                key={index}
                className={clsx(
                  'h-1.5 rounded-full bg-gray-200',
                  index === currentPage ? 'w-7' : 'w-1.5'
                )}
              ></View>
            )
          })}
        </View>
        <TouchableOpacity
          onPress={async () => {
            await completeOnboarding()
            router.replace('/(tabs)')
          }}
          className="bg-orange-500 w-full rounded-full py-4"
        >
          <Text className="text-lg font-semibold text-center text-white">
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView></View>
  )
}
