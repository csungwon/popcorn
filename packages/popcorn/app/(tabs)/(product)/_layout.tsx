import { Stack } from 'expo-router'

export default function ProductLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Product Search' }} />
      <Stack.Screen name="product/[productId]" options={{ title: 'Product Details' }} />
    </Stack>
  )
}
