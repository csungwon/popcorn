import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync
} from 'expo-location'
import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import MapView, { PROVIDER_GOOGLE, type Region } from 'react-native-maps'

export default function SearchScreen() {
  const [region, setRegion] = useState<Region>()
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
    <View style={[styles.container]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={[styles.map, { bottom: tabBarHeight }]}
        showsUserLocation
        mapType="standard"
        showsMyLocationButton
        initialRegion={region}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
})
