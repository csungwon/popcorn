import StoreChip from '@/components/StoreChip'
import microwaveAxiosInstance from '@/utils/microwaveAxios'
import GorhomBottomSheet, {
  BottomSheetTextInput,
  BottomSheetView
} from '@gorhom/bottom-sheet'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { Image } from 'expo-image'
import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync
} from 'expo-location'
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
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  type Region
} from 'react-native-maps'

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
  const [region, setRegion] = useState<Region>()
  const [search, setSearch] = useState<string>('')
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [isSearchInputFocused, setIsSearchInputFocused] =
    useState<boolean>(false)
  const tabBarHeight = useBottomTabBarHeight()
  const mapViewRef = useRef<MapView>(null)
  const nearbyStoreListRef = useRef<FlatList>(null)

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await requestForegroundPermissionsAsync()
      await new Promise((resolve) => setTimeout(resolve, 1000))
      if (status !== 'granted') {
        console.error('Permission to access location was denied')
        return
      }
      const location = await getCurrentPositionAsync({})
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 5 / 69, // simple calculation for 2 miles
        longitudeDelta: 5 / (69 * Math.cos(location.coords.latitude)) // simple calculation for 2 miles
      })
    }
    getCurrentLocation()
  }, [])

  // fetch nearby stores
  const { data: nearbyStores, isSuccess } = useQuery({
    queryKey: ['nearbyStores', region?.latitude, region?.longitude],
    queryFn: async (): Promise<Store[]> => {
      const response = await microwaveAxiosInstance.get(
        `/api/v1/nearby_stores?lat=${region?.latitude}&lng=${region?.longitude}`
      )
      return response.data
    },
    enabled: !!region
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

  if (!region) {
    return null
  }

  const handleStoreSelect = (store: Store) => {
    if (selectedStore === store._id) {
      setSelectedStore(null)
      mapViewRef.current?.animateCamera({
        center: {
          latitude: region?.latitude - 0.05,
          longitude: region?.longitude
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
        index: nearbyStores?.findIndex(nearbyStore => nearbyStore._id === store._id)!
      })
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="w-full h-full">
        <MapView
          provider={PROVIDER_GOOGLE}
          showsUserLocation
          mapType="standard"
          style={{ position: 'absolute', inset: 0 }}
          showsMyLocationButton
          initialRegion={region}
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
                <View className="flex-row items-center gap-1 left-full">
                  <Image
                    source={require('@/assets/images/marker.png')}
                    className="w-[21] h-[30]"
                  />
                  <View
                    className={clsx(
                      'max-w-[140px] rounded-full px-1.5 py-1 shadow-mapCallout',
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
        <BottomSheet
          className="rounded-t-2xl shadow-bottomSheet"
          handleIndicatorClassName="w-[135] h-[5px] bg-gray-300"
          index={1}
          bottomInset={tabBarHeight}
          snapPoints={['40%']}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
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
              contentContainerStyle={{
                alignItems: 'flex-start',
                gap: 8,
                marginTop: 16
              }}
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
        </BottomSheet>
      </View>
    </TouchableWithoutFeedback>
  )
}
