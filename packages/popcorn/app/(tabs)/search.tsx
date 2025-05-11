import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps'
import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync
} from 'expo-location'

export default function SearchScreen() {
  const [region, setRegion] = useState<Region>()
  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        console.log('Permission to access location was denied')
        return
      }
      const location = await getCurrentPositionAsync({})
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 2 / 69,
        longitudeDelta: 2 / (69 * Math.cos(location.coords.latitude))
      })
    }
    getCurrentLocation()
  }, [])
  return (
    <View style={styles.container}>
      <MapView region={region} provider={PROVIDER_GOOGLE} style={styles.map} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    width: '100%',
    height: '100%'
  }
})
