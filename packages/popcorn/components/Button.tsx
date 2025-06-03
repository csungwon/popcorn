import clsx from 'clsx'
import { Image, ImageSource } from 'expo-image'
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View
} from 'react-native'

type ButtonProps = TouchableOpacityProps & {
  label: string
  labelClassName?: string
  type?: 'primary' | 'secondary' | 'tertiary'
  iconSource?: ImageSource
}

export default function Button({
  label,
  labelClassName,
  type = 'primary',
  iconSource,
  className,
  ...touchableOpacityProps
}: ButtonProps) {
  return (
    <TouchableOpacity
      {...touchableOpacityProps}
      className={clsx(
        'flex flex-row items-center justify-center w-full rounded-full py-3.5 relative',
        type === 'primary' && 'bg-orange-500',
        type === 'secondary' && 'bg-white',
        type === 'secondary' && 'border border-gray-300',
        type === 'tertiary' && 'bg-gray-50',
        className
      )}
    >
      {iconSource && (
        <View className="absolute left-4 h-full items-center justify-center">
            <Image source={iconSource} className='w-6 h-6' />
        </View>
      )}
      <Text
        className={clsx(
          'flex-grow text-lg text-center',
          (type === 'primary' || type === 'secondary') && 'font-semibold',
          type === 'primary' && 'text-white',
          (type === 'secondary' || type === 'tertiary') && 'text-gray-900',
          labelClassName
        )}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}
