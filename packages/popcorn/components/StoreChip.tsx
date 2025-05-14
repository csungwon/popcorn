import { Image, ImageSource } from 'expo-image'
import { StyleSheet, Text, View } from 'react-native'

type StoreChipProps = {
  isActive?: boolean
  name: string
  logo: ImageSource
}

export default function StoreChip({ isActive, name, logo }: StoreChipProps) {
  return (
    <View style={[ styles.container, isActive && { backgroundColor: '#ff860d'}]}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.name}>{name}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#e8e8e8',
    paddingLeft: 8,
    paddingRight: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    gap: 4
  },
  logo: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    backgroundColor: 'white',
  },
  name: {
    color: '#000',
    fontSize: 15,
    lineHeight: 20
  }
})