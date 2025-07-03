import { useLocalSearchParams } from 'expo-router'
import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProductDetailsScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>()
  return (
    <SafeAreaView>
      <Text>Product Detail Screen for Product {productId}</Text>
    </SafeAreaView>
  )
}
