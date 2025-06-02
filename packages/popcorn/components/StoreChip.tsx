import clsx from 'clsx'
import { Image, ImageSource } from 'expo-image'
import { Text, View } from 'react-native'

type StoreChipProps = {
  isActive?: boolean
  name: string
  logo: ImageSource
}

export default function StoreChip({ isActive, name, logo }: StoreChipProps) {
  return (
    <View
      className={clsx(
        'flex flex-row py-1.5 pl-2 pr-2.5 rounded-full gap-1',
        isActive ? 'bg-orange-500' : 'bg-gray-100'
      )}
    >
      <Image source={logo} className="w-[22px] h-[22px] rounded-full bg-white" />
      <Text className="text-black text-sm">{name}</Text>
    </View>
  )
}
