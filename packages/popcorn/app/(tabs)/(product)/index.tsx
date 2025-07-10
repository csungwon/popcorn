import StoreChip from '@/components/StoreChip'
import { useUserLocation } from '@/context/UserLocation'
import { useDebounce } from '@/hooks/useDebounce'
import { calculateDistance } from '@/utils/calculateDistance'
import microwaveAxiosInstance from '@/utils/microwaveAxios'
import GorhomBottomSheet, {
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView
} from '@gorhom/bottom-sheet'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { Image, ImageSource } from 'expo-image'
import { Link } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { cssInterop } from 'nativewind'
import { ComponentRef, useEffect, useMemo, useRef, useState } from 'react'
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

type Product = {
  _id: string
  name: string
  quantity: {
    unit: string
    value: number
  }
  poster: {
    firstName: string
    lastName: string
  }
  likedUsers: string[]
  store: Store
  price: {
    currencyCode: string
    amount: number
  }
  image: ImageSource
  description: string
  createdAt: string
}

type SearchSuggestion = {
  stores: string[]
  products: string[]
}

export default function SearchScreen() {
  const { userLocation } = useUserLocation()
  const [search, setSearch] = useState<string>('')
  const debouncedSearch = useDebounce(search, 200)
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [storeFilter, setStoreFilter] = useState<string | null>(null)
  const [isSearchInputFocused, setIsSearchInputFocused] =
    useState<boolean>(false)
  const tabBarHeight = useBottomTabBarHeight()
  const mapViewRef = useRef<MapView>(null)
  const nearbyStoreListRef = useRef<FlatList>(null)
  const searchInputRef = useRef<ComponentRef<typeof BottomSheetTextInput>>(null)
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] =
    useState<boolean>(false)

  const userLatitude = userLocation.coords.latitude
  const userLongitude = userLocation.coords.longitude

  const { data: nearbyStores = [], isSuccess: isNearbyStoresSuccess } =
    useQuery({
      queryKey: ['nearbyStores', userLatitude, userLongitude, debouncedSearch],
      queryFn: async (): Promise<Store[]> => {
        const queryParams = new URLSearchParams({
          lat: userLatitude.toString(),
          lng: userLongitude.toString(),
          query: debouncedSearch
        })
        const response = await microwaveAxiosInstance.get(
          `/api/v1/nearby_stores?${queryParams.toString()}`
        )
        return response.data
      },
      enabled: !!(userLatitude && userLongitude && !isSearchInputFocused)
    })

  const storesToShow = useMemo(() => {
    // If a specific store is selected, show only that store
    if (selectedStoreId) {
      return [nearbyStores.find((store) => store._id === selectedStoreId)!]
    }

    // If a store filter is applied, show only stores that match the filter
    if (!!storeFilter) {
      return nearbyStores.filter((store) => store.name === storeFilter)
    }

    // Otherwise, show all nearby stores
    return nearbyStores
  }, [selectedStoreId, storeFilter, nearbyStores])

  useEffect(() => {
    if (isNearbyStoresSuccess) {
      mapViewRef.current?.fitToCoordinates(
        [
          ...storesToShow.map((store) => store.location),
          { latitude: userLatitude, longitude: userLongitude }
        ],
        {
          animated: true,
          edgePadding: {
            top: 100,
            right: 100,
            bottom: isBottomSheetExpanded ? 500 : 400,
            left: 100
          }
        }
      )
    }
  }, [nearbyStores, isNearbyStoresSuccess, storesToShow, isBottomSheetExpanded])

  // De-duplicate stores by name
  const nearbyStoresUniqueByName = [
    ...new Map<string, Store>(
      nearbyStores.map((store) => [store.name, store])
    ).values()
  ]

  const selectedStore = nearbyStores.find(
    (store) => store._id === selectedStoreId
  )

  const { data: nearbyProducts, isSuccess: isNearbyProductsSuccess } = useQuery(
    {
      queryKey: ['nearbyProducts', userLatitude, userLongitude, debouncedSearch],
      queryFn: async (): Promise<Product[]> => {
        const queryParams = new URLSearchParams({
          lat: userLatitude.toString(),
          lng: userLongitude.toString(),
          query: debouncedSearch
        })
        const response = await microwaveAxiosInstance.get(
          `/api/v1/product?${queryParams.toString()}`
        )
        return response.data
      },
      enabled: !!(userLatitude && userLongitude)
    }
  )

  const productsToShow = useMemo(() => {
    if (!isNearbyProductsSuccess) {
      return []
    }

    // If a specific store is selected, show only products from that store
    if (selectedStoreId) {
      return nearbyProducts.filter(
        (product) => product.store._id === selectedStoreId
      )
    }

    // else show all products from nearby stores
    return nearbyProducts
  }, [selectedStoreId, nearbyProducts])

  // handle store filter selection
  const handleStoreFilter = (storeName: string) => {
    setSelectedStoreId(null)
    if (storeFilter === storeName) {
      setStoreFilter(null)
      nearbyStoreListRef.current?.scrollToIndex({
        animated: true,
        index: 0
      })
    } else {
      setStoreFilter(storeName)
      nearbyStoreListRef.current?.scrollToIndex({
        animated: true,
        index: nearbyStoresUniqueByName.findIndex(
          (nearbyStore) => nearbyStore.name === storeName
        )
      })
    }
  }

  // fetch search suggestions based on the current search input
  const { data: searchSuggestions, isSuccess: isSearchSuggestionsSuccess } =
    useQuery({
      queryKey: ['searchSuggestions', debouncedSearch],
      queryFn: async (): Promise<SearchSuggestion> => {
        const response = await microwaveAxiosInstance.get(
          `/api/v1/search/suggestions?query=${encodeURIComponent(debouncedSearch)}`
        )
        return response.data
      },
      enabled: !!debouncedSearch
    })

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
                    visibility: 'on' // turning this off as it interferes with our own markers
                  }
                ]
              }
            ]}
          >
            {isNearbyStoresSuccess &&
              storesToShow.map((store) => (
                <Marker
                  key={store._id}
                  coordinate={store.location}
                  anchor={{ x: 0.53, y: 1 }}
                  onPress={() => {
                    setSelectedStoreId(
                      selectedStoreId === store._id ? null : store._id
                    )
                    // handleStoreFilter(store.name)
                  }}
                >
                  <View className="flex-row items-center gap-1">
                    <Image
                      source={require('@/assets/images/marker.png')}
                      className="w-[21] h-[30]"
                    />
                    <View
                      className={clsx(
                        'max-w-[140px] rounded-full px-1.5 py-1 shadow-mapCallout',
                        selectedStoreId === store._id
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
        snapPoints={[278, 364]}
        bottomInset={tabBarHeight}
        enableDynamicSizing={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        enableContentPanningGesture={false}
        onChange={(index) => {
          setIsBottomSheetExpanded(index === 1)
        }}
      >
        <BottomSheetView className="px-4 pt-2">
          {/* Search Input */}
          <View
            className={clsx(
              'flex flex-row items-center border border-black/20 rounded-full overflow-hidden',
              isSearchInputFocused && 'bg-gray-100'
            )}
          >
            <View className="absolute left-2 z-10">
              {isSearchInputFocused ? (
                <TouchableOpacity
                  onPress={() => {
                    setSearch('')
                    // manually blur the input as BottomSheet does not handle it very well
                    searchInputRef.current?.blur()
                  }}
                >
                  <SymbolView
                    name="chevron.left"
                    tintColor="#3c3c4399"
                    type="monochrome"
                    size={20}
                  />
                </TouchableOpacity>
              ) : (
                <SymbolView
                  name="magnifyingglass"
                  tintColor="#3c3c4399"
                  type="monochrome"
                  size={20}
                />
              )}
            </View>
            <BottomSheetTextInput
              ref={searchInputRef}
              placeholder="Search"
              className="p-2 pl-9 flex-1 text-lg leading-tight placeholder:text-gray-800/60"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
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
          <FlatList<Store>
            data={nearbyStoresUniqueByName}
            keyExtractor={(store) => store._id}
            horizontal
            contentContainerClassName="flex-row gap-2 mb-1"
            className="mt-4 mb-2"
            showsHorizontalScrollIndicator={false}
            ref={nearbyStoreListRef}
            renderItem={({ item: store }) => (
              <TouchableOpacity onPress={() => handleStoreFilter(store.name)}>
                <StoreChip
                  name={store.name}
                  logo={store.iconUrl}
                  isActive={storeFilter === store.name}
                />
              </TouchableOpacity>
            )}
          />
        </BottomSheetView>

        {isSearchInputFocused ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && !search.length && (
              <View className="px-4 mt-1">
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
                        onPress={() => {
                          setSearch(search)
                          // manually blur the input as BottomSheet does not handle it very well
                          searchInputRef.current?.blur()
                        }}
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

            {/* Search Suggestions */}
            {search.length > 0 && isSearchSuggestionsSuccess && (
              <View className="px-4 pt-1">
                {searchSuggestions.products.map((product) => (
                  <TouchableOpacity
                    key={product}
                    onPress={() => {
                      setSearch(product)
                      // manually blur the input as BottomSheet does not handle it very well
                      searchInputRef.current?.blur()
                    }}
                  >
                    <View className="flex flex-row justify-between items-center">
                      <View className="flex flex-row items-center gap-2.5">
                        <SymbolView
                          name="magnifyingglass.circle.fill"
                          tintColor="#707070"
                          type="monochrome"
                          size={28}
                        />
                        <Text className="text-lg text-gray-800">{product}</Text>
                      </View>
                      <View>
                        <SymbolView
                          name="arrow.up.left"
                          tintColor="#707070"
                          type="monochrome"
                          size={20}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            {/* Nearby products */}
            {selectedStore && (
              <View className="px-4 pt-2 pb-3">
                <View className="flex-row items-center gap-1">
                  <Text className="text-lg">{selectedStore.name}</Text>
                  <View className="w-1 h-1 rounded-full bg-gray-400"></View>
                  <Text>
                    {calculateDistance(
                      {
                        latitude: userLatitude,
                        longitude: userLongitude
                      },
                      selectedStore.location
                    )}
                    mi
                  </Text>
                </View>
                <Text className="mt-0.5 text-xs text-gray-500">
                  {selectedStore.address}
                </Text>
              </View>
            )}
            {isNearbyProductsSuccess && (
              <BottomSheetScrollView
                className="px-4 gap-6"
                showsVerticalScrollIndicator={false}
              >
                {productsToShow.map((product: any) => {
                  return (
                    <Link key={product._id} href={`/product/${product._id}`}>
                      <View className="border-b border-gray-100 w-full">
                        <View className="flex-row gap-3 py-4">
                          <View className="flex-row w-[90] h-[90] rounded-md bg-gray-100 grid place-items-center">
                            <Image
                              source={product.image}
                              className="w-full h-full"
                            />
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
                                  {product.poster.firstName}{' '}
                                  {product.poster.lastName}
                                </Text>
                              </View>
                              <View className="absolute right-0 py-1 px-3 border border-gray-200 flex-row rounded-full gap-1.5">
                                <SymbolView
                                  name="heart"
                                  size={18}
                                  tintColor="#000"
                                />
                                <Text>{product.likedUsers.length || 0}</Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    </Link>
                  )
                })}
              </BottomSheetScrollView>
            )}
          </>
        )}
      </BottomSheet>
    </>
  )
}
