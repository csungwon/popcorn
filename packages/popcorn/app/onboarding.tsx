import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useOnboardingStatus } from '@/context/OnboardingStatusContext'

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
    <View>
      <FlatList
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={({ viewableItems }) => {
          const currentIndex = viewableItems[0]?.index || 0
          setCurrentPage(currentIndex)
        }}
        renderItem={({ item, index }) => (
          <View
            style={{
              width: DEVICE_WIDTH,
              height: DEVICE_HEIGHT - insets.top - insets.bottom,
              overflow: 'hidden'
            }}
          >
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Image
                source={item.image}
                style={{ width: '100%', resizeMode: 'cover' }}
              />
            </View>
            <View
              style={{
                height: 350,
                paddingHorizontal: 16,
                paddingVertical: 22,
                flex: 0
              }}
            >
              <View style={{ flex: 0 }}>
                <Text
                  style={{ fontSize: 28, lineHeight: 34, fontWeight: 'bold' }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    lineHeight: 21,
                    color: '#696969',
                    marginTop: 8
                  }}
                >
                  {item.subtitle}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'flex-end'
                }}
              ></View>
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 20,
          left: 16,
          right: 16,
          alignItems: 'center'
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            width: 60,
            gap: 10,
            marginBottom: 14
          }}
        >
          {pages.map((_, index) => {
            return (
              <View
                key={index}
                style={{
                  width: index === currentPage ? 28 : 6,
                  height: index === currentPage ? 4 : 6,
                  borderRadius: index === currentPage ? 2 : 3,
                  backgroundColor: '#d9d9d9',
                  opacity: 1
                }}
              ></View>
            )
          })}
        </View>
        <TouchableOpacity
          onPress={async () => {
            await completeOnboarding()
            router.replace('/(tabs)')
          }}
          style={{
            backgroundColor: '#FF860D',
            paddingVertical: 14,
            width: '100%',
            borderRadius: 25
          }}
        >
          <Text
            style={{
              fontSize: 17,
              lineHeight: 21,
              fontWeight: 'semibold',
              textAlign: 'center',
              color: 'white'
            }}
          >
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
