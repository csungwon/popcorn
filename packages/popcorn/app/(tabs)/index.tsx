import StoreChip from '@/components/StoreChip'
import { useUserLocation } from '@/context/UserLocation'
import microwaveAxiosInstance from '@/utils/microwaveAxios'
import GorhomBottomSheet, {
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView
} from '@gorhom/bottom-sheet'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { Image } from 'expo-image'
import { SymbolView } from 'expo-symbols'
import { cssInterop } from 'nativewind'
import { useEffect, useRef, useState } from 'react'
import {
  FlatList,
  Keyboard,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'

// Configure nativewind to work with @gorhom/bottom-sheet
const BottomSheet = cssInterop(GorhomBottomSheet, {
  className: 'style',
  handleIndicatorClassName: 'handleIndicatorStyle'
})

const recentSearches = [
  {
    search: 'Banana',
    searchedAt: '2023-10-01T12:00:00Z'
  },
  {
    search: 'Apple',
    searchedAt: '2023-10-01T13:00:00Z'
  },
  {
    search: 'Orange',
    searchedAt: '2023-10-01T15:00:00Z'
  }
]

// return type of the API response
// TODO: share the type from the microwave package
type Store = {
  _id: string
  name: string
  iconUrl: string
  address: string
  location: {
    longitude: number
    latitude: number
  }
}

export default function SearchScreen() {
  const { userLocation } = useUserLocation()
  const [search, setSearch] = useState<string>('')
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [isSearchInputFocused, setIsSearchInputFocused] =
    useState<boolean>(false)
  const tabBarHeight = useBottomTabBarHeight()
  const mapViewRef = useRef<MapView>(null)
  const nearbyStoreListRef = useRef<FlatList>(null)

  const userLatitude = userLocation.coords.latitude
  const userLongitude = userLocation.coords.longitude

  const { data: nearbyStores, isSuccess } = useQuery({
    queryKey: ['nearbyStores', userLatitude, userLongitude],
    queryFn: async (): Promise<Store[]> => {
      const response = await microwaveAxiosInstance.get(
        `/api/v1/nearby_stores?lat=${userLatitude}&lng=${userLongitude}`
      )
      return response.data
    },
    enabled: !!(userLatitude && userLongitude)
  })

  useEffect(() => {
    if (isSuccess && nearbyStores.length > 0) {
      mapViewRef.current?.fitToCoordinates(
        nearbyStores.map((store) => store.location),
        {
          animated: true,
          edgePadding: { top: 100, right: 100, bottom: 500, left: 45 }
        }
      )
    }
  }, [nearbyStores, isSuccess])

  const { data: nearbyProducts, isSuccess: isNearbyProductsSuccess } = useQuery(
    {
      queryKey: ['nearbyProducts', userLatitude, userLongitude],
      queryFn: async () => {
        const response = await microwaveAxiosInstance.get(
          `/api/v1/product?lat=${userLatitude}&lng=${userLongitude}`
        )
        return response.data
      },
      enabled: !!(userLatitude && userLongitude)
    }
  )



  const handleStoreSelect = (store: Store) => {
    if (selectedStore === store._id) {
      setSelectedStore(null)
      mapViewRef.current?.animateCamera({
        center: {
          latitude: userLatitude - 0.05,
          longitude: userLongitude
        },
        zoom: 12
      })
      nearbyStoreListRef.current?.scrollToIndex({
        animated: true,
        index: 0
      })
    } else {
      setSelectedStore(store._id)
      mapViewRef.current?.animateCamera({
        center: {
          latitude: store.location.latitude - 0.003,
          longitude: store.location.longitude
        },
        zoom: 16
      })
      nearbyStoreListRef.current?.scrollToIndex({
        animated: true,
        index: nearbyStores?.findIndex(
          (nearbyStore) => nearbyStore._id === store._id
        )!
      })
    }
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="w-full h-full">
          <MapView
            provider={PROVIDER_GOOGLE}
            showsUserLocation
            mapType="standard"
            style={{ position: 'absolute', inset: 0 }}
            initialCamera={{
              center: { latitude: 37.409078, longitude: -121.89276 },
              zoom: 13,
              heading: 0,
              pitch: 0
            }}
            ref={mapViewRef}
            customMapStyle={[
              {
                featureType: 'poi.business',
                stylers: [
                  {
                    visibility: 'off' // turning this off as it interferes with our own markers
                  }
                ]
              }
            ]}
          >
            {isSuccess &&
              nearbyStores?.length > 0 &&
              nearbyStores.map((store) => (
                <Marker
                  key={store._id}
                  coordinate={store.location}
                  anchor={{ x: 0.53, y: 1 }}
                  onPress={() => handleStoreSelect(store)}
                >
                  <View className="flex-row items-center gap-1">
                    <Image
                      source={require('@/assets/images/marker.png')}
                      className="w-[21] h-[30]"
                    />
                    <View
                      className={clsx(
                        'absolute left-7 max-w-[140px] rounded-full px-1.5 py-1 shadow-mapCallout',
                        selectedStore === store._id
                          ? 'bg-orange-500'
                          : 'bg-orange-100'
                      )}
                    >
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className="text-base"
                      >
                        {store.name}
                      </Text>
                    </View>
                  </View>
                </Marker>
              ))}
          </MapView>
        </View>
      </TouchableWithoutFeedback>
      <BottomSheet
        className="rounded-t-2xl shadow-bottomSheet"
        handleIndicatorClassName="w-[135] h-[5] bg-gray-300"
        index={0}
        snapPoints={['40%', '60%']}
        bottomInset={tabBarHeight}
        enableDynamicSizing={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        enableContentPanningGesture={false}
      >
        <BottomSheetView className="px-4 pt-2">
          {/* Search Input */}
          <View
            className={clsx(
              'flex flex-row items-center border border-black/20 rounded-full overflow-hidden',
              isSearchInputFocused && 'bg-gray-100'
            )}
          >
            <View className="absolute left-2">
              <SymbolView
                name="magnifyingglass"
                tintColor="#3c3c4399"
                type="monochrome"
              />
            </View>
            <BottomSheetTextInput
              placeholder="Search"
              className="p-2 pl-9 flex-1 text-lg leading-tight placeholder:text-gray-800/60"
              value={search}
              onChangeText={setSearch}
              onFocus={() => setIsSearchInputFocused(true)}
              onBlur={() => setIsSearchInputFocused(false)}
            />
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch('')}
                className="pr-1.5 self-stretch flex justify-center"
              >
                <SymbolView
                  name="xmark.circle.fill"
                  tintColor="#3c3c4399"
                  type="monochrome"
                />
              </TouchableOpacity>
            )}
          </View>
          {/* Nearby Stores */}
          <FlatList
            data={nearbyStores || []}
            keyExtractor={(store) => store._id}
            horizontal
            contentContainerClassName="flex-row gap-2 mb-1"
            className="mt-4 mb-2"
            showsHorizontalScrollIndicator={false}
            ref={nearbyStoreListRef}
            renderItem={({ item: store, index }) => (
              <TouchableOpacity
                onPress={() => {
                  handleStoreSelect(store)
                }}
              >
                <StoreChip
                  name={store.name}
                  logo={store.iconUrl}
                  isActive={selectedStore === store._id}
                />
              </TouchableOpacity>
            )}
          />
          {/* Recent Searches */}
          {recentSearches.length > 0 &&
            isSearchInputFocused &&
            !search.length && (
              <View className="mt-4">
                <Text className="text-lg">Recent Searches</Text>
                <View className="mt-2">
                  {recentSearches
                    .slice()
                    .sort(
                      (s1, s2) =>
                        new Date(s1.searchedAt).getTime() -
                        new Date(s2.searchedAt).getTime()
                    )
                    .map(({ search }) => (
                      <TouchableOpacity
                        key={search}
                        onPress={() => setSearch(search)}
                      >
                        <View className="flex flex-row items-center gap-1 py-1">
                          <SymbolView
                            name="clock.arrow.circlepath"
                            tintColor="#707070"
                            type="monochrome"
                          />
                          <Text className="text-lg text-gray-800">
                            {search}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            )}
        </BottomSheetView>
        {/* Nearby products */}
        {isNearbyProductsSuccess && (
          <BottomSheetScrollView
            className="px-4 gap-6"
            showsVerticalScrollIndicator={false}
          >
            {nearbyProducts.map((product: any) => {
              return (
                <View
                  key={product._id}
                  className="py-4 border-b border-gray-100"
                >
                  <View className="flex-row gap-3 py-4">
                    <View className="flex-row w-[90] h-[90] rounded-md bg-gray-100 grid place-items-center">
                      <Image source={product.image} className="w-full h-full" />
                    </View>
                    <View className="gap-1 grow">
                      <View className="flex-row gap-1 items-center">
                        <Image
                          className="w-[22] h-[22] rounded-full border border-gray-200"
                          source={product.store.iconUrl}
                          contentFit="contain"
                        />
                        <View className="flex-row items-center gap-1">
                          <Text className="text-sm text-gray-500">
                            {product.store.name}
                          </Text>
                          <View className="w-1 h-1 rounded-full bg-gray-500"></View>
                          <Text className="text-sm text-gray-500">
                            {calculateDistance(
                              {
                                latitude: userLatitude,
                                longitude: userLongitude
                              },
                              product.store.location
                            )}
                            mi
                          </Text>
                        </View>
                      </View>
                      <Text className="text-xl text-black">
                        {product.price.currencyCode === 'USD' ? '$' : ''}
                        {product.price.amount}
                      </Text>
                      <Text className="text-base text-black">
                        {product.quantity.value}
                        {product.quantity.unit} {product.name}
                      </Text>
                      <View className="mt-4 w-full rounded-full px-2.5 py-1 flex-row items-center border border-gray-200">
                        <View className="flex-row gap-1 items-center">
                          <SymbolView
                            name="person.circle"
                            size={18}
                            tintColor="#000"
                          />
                          <Text>
                            {product.poster.firstName} {product.poster.lastName}
                          </Text>
                        </View>
                        <View className="absolute right-0 py-1 px-3 border border-gray-200 flex-row rounded-full gap-1.5">
                          <SymbolView name="heart" size={18} tintColor="#000" />
                          <Text>{product.likedUsers.length || 0}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )
            })}
          </BottomSheetScrollView>
        )}
      </BottomSheet>
    </>
  )
}

type Point = {
  latitude: number
  longitude: number
}

function calculateDistance(p1: Point, p2: Point) {
  const lat1Rad = p1.latitude * (Math.PI / 180)
  const lat2Rad = p2.latitude * (Math.PI / 180)

  const avgLatRad = (lat1Rad + lat2Rad) / 2

  const deltaLatDeg = p2.latitude - p1.latitude
  const deltaLonDeg = p2.longitude - p1.longitude

  const x = deltaLonDeg * Math.cos(avgLatRad)
  const y = deltaLatDeg

  const distanceDegrees = Math.sqrt(x * x + y * y)

  const milesPerDegree = 69.0

  const distanceMiles = distanceDegrees * milesPerDegree

  // round to 10th
  return Math.round(Math.abs(distanceMiles) * 10) / 10
}
