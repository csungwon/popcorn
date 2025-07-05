import BackButton from '@/components/BackButton'
import ImageWithFallback from '@/components/ImageWithFallback'
import { useUserLocation } from '@/context/UserLocation'
import { calculateDistance } from '@/utils/calculateDistance'
import microwaveAxiosInstance from '@/utils/microwaveAxios'
import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useLocalSearchParams } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

type Product = {
  _id: string
  name: string
  description: string
  quantity: {
    unit: string
    value: number
  }
  price: {
    currencyCode: string
    amount: number
  }
  poster: {
    _id: string
    firstName: string
    lastName: string
    imageUrl: string
  }
  createdAt: string
  image: string
  store: {
    name: string
    location: {
      latitude: number
      longitude: number
    }
    iconUrl: string
  }
  likedUsers: string[]
}

export default function ProductDetailsScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>()
  const [showFallbackStoreLogo, setShowFallbackStoreLogo] = useState(false)
  const { userLocation } = useUserLocation()

  const {
    data: product,
    isLoading,
    error,
    isSuccess
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: async (): Promise<Product> => {
      // Fetch product details from an API or database
      // Example: return fetch(`/api/products/${productId}`).then(res => res.json())
      const response = await microwaveAxiosInstance.get(
        `/api/v1/product/${productId}`
      )
      return response.data
    }
  })

  // Effect to handle fallback for store logo
  useEffect(() => {
    if (isSuccess && !product.store.iconUrl) {
      setShowFallbackStoreLogo(true)
    }
  }, [product?.store.iconUrl, isSuccess])

  const handleLikePress = () => {
    // TODO: integrate with backend API
    alert('Liked the product!')
  }

  return (
    <View className="bg-white flex-1">
      {isLoading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>Error: {error.message}</Text>
      ) : isSuccess ? (
        <>
          {/* Product Image */}
          <View className="items-center justify-center w-full px-8 pt-16 pb-8 border border-gray-100 rounded-2xl">
            <ImageWithFallback
              className="w-64 h-[265]"
              source={product?.image}
              fallbackSource={require('@/assets/images/popcorn.png')}
            />
          </View>
          {/* Product Details */}
          <View className="border-b-2 border-gray-100 mt-2.5 px-4 pb-7">
            <View className="flex-row items-center gap-1">
              <View className="w-6 h-6 items-center justify-center p-0.25 rounded-full border border-gray-100">
                {showFallbackStoreLogo ? (
                  <SymbolView name="cart.fill" size={18} tintColor="#707070" />
                ) : (
                  <Image
                    source={product.store.iconUrl}
                    className="w-full h-full object-cover rounded-full"
                    onError={() => setShowFallbackStoreLogo(true)}
                  />
                )}
              </View>
              <View className="flex-row gap-1 items-center">
                <Text className="text-gray-700">{product.store.name}</Text>
                <View className="w-1 h-1 bg-gray-700 rounded-full" />
                <Text className="text-gray-700">
                  {calculateDistance(
                    userLocation.coords,
                    product.store.location
                  )}
                  mi
                </Text>
              </View>
            </View>
            <Text className="mt-1 text-xl text-gray-900 font-semibold">
              ${product.price.amount}
            </Text>
            <Text className="text-base text-gray-900">
              {product.quantity.value} {product.quantity.unit} {product.name}
            </Text>
          </View>
          {/* Poster info */}
          <View className="mt-2 px-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              {product.poster.imageUrl ? (
                <Image
                  source={product.poster.imageUrl}
                  className="w-6 h-6 rounded-full border border-gray-200"
                />
              ) : (
                <SymbolView
                  name="person.circle"
                  size={24}
                  tintColor="#1C1C1C"
                />
              )}
              <Text className="text-sm">
                {product.poster.firstName} {product.poster.lastName}
              </Text>
            </View>
            <Pressable
              hitSlop={5}
              onPress={handleLikePress}
              className="flex-row items-center gap-1 py-1 px-2 border border-gray-200 rounded-full"
            >
              <SymbolView name="heart" size={20} tintColor="#000" />
              <Text className="text-sm">{product.likedUsers.length}</Text>
            </Pressable>
          </View>
          {/* Product Description */}
          <View className="mt-2 px-4">
            <Text className="text-gray-700 text-sm">
              {new Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(
                Date.parse(product.createdAt)
              )}
            </Text>
            <Text className="mt-1 text-sm text-gray-700">
              {product.description}
            </Text>
          </View>
        </>
      ) : null}
      <BackButton className="absolute left-4 top-14 shadow-sm" />
    </View>
  )
}
