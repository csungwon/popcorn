import clsx from 'clsx'
import { Image, ImageSource } from 'expo-image'
import { SymbolView } from 'expo-symbols'
import { useState } from 'react'
import { Text, View } from 'react-native'

type StoreChipProps = {
  isActive?: boolean
  name: string
  logo?: ImageSource | string | null
}

export default function StoreChip({ isActive, name, logo }: StoreChipProps) {
  const [logoUrl, setLogoUrl] = useState(logo)

  return (
    <View
      className={clsx(
        'flex flex-row py-1.5 pl-2 pr-2.5 rounded-full gap-1 items-center',
        isActive ? 'bg-orange-500' : 'bg-gray-100'
      )}
    >
      {logoUrl ? (
        <Image
          onError={() => setLogoUrl(null)}
          source={logo}
          className="w-[22px] h-[22px] rounded-full bg-white"
          contentFit="contain"
        />
      ) : (
        <SymbolView
          name="cart.circle.fill"
          tintColor="#707070"
          type="monochrome"
          size={22}
        />
      )}

      <Text className="text-black text-sm">{name}</Text>
    </View>
  )
}
