import { SymbolView } from 'expo-symbols'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync
} from 'expo-location'
import { useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Text
} from 'react-native'
import MapView, { PROVIDER_GOOGLE, type Region } from 'react-native-maps'
import BottomSheet, {
  BottomSheetView,
  BottomSheetTextInput
} from '@gorhom/bottom-sheet'

export default function SearchScreen() {
  const [region, setRegion] = useState<Region>()
  const [search, setSearch] = useState<string>('')
  const [isSearchInputFocused, setIsSearchInputFocused] =
    useState<boolean>(false)

  const tabBarHeight = useBottomTabBarHeight()

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
        latitudeDelta: 2 / 69, // simple calculation for 2 miles
        longitudeDelta: 2 / (69 * Math.cos(location.coords.latitude)) // simple calculation for 2 miles
      })
    }
    getCurrentLocation()
  }, [])

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={[styles.container]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={[styles.map, { bottom: tabBarHeight }]}
        showsUserLocation
        mapType="standard"
        showsMyLocationButton
        initialRegion={region}
      />
        <BottomSheet
          style={styles.bottomSheetShadow}
          handleIndicatorStyle={{
            backgroundColor: '#b4b4b4',
            width: 135
          }}
          index={1}
          bottomInset={tabBarHeight}
          snapPoints={['40%']}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
        >
          <BottomSheetView
            style={{ flex: 1, paddingHorizontal: 16, marginTop: 16}}
          >
            <View
              style={[
                styles.searchInputContainer,
                { backgroundColor: isSearchInputFocused ? '#e8e8e8' : 'white' }
              ]}
            >
              <SymbolView
                name="magnifyingglass"
                style={styles.searchIcon}
                tintColor="#3c3c4399"
                type="monochrome"
              />
              <BottomSheetTextInput
                placeholder="Search"
                placeholderTextColor="rgba(60, 60, 67, .6)"
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                onFocus={() => setIsSearchInputFocused(true)}
                onBlur={() => setIsSearchInputFocused(false)}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <SymbolView
                    name="xmark.circle.fill"
                    style={styles.clearIcon}
                    tintColor="#3c3c4399"
                    type="monochrome"
                  />
                </TouchableOpacity>
              )}
            </View>
          </BottomSheetView>
        </BottomSheet>
    </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  searchInputContainer: {
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 7,
    fontSize: 32,
    height: 46,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1
  },
  searchInput: {
    fontSize: 17,
    lineHeight: 22,
    flex: 1
  },
  clearIcon: {
    marginLeft: 8
  },
  searchIcon: {
    marginRight: 8
  },
  bottomSheetShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24
  }
})
