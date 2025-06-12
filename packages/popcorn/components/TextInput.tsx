import clsx from 'clsx'
import { SymbolView } from 'expo-symbols'
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  Text,
  View
} from 'react-native'

type TextInputProps = RNTextInputProps & {
  error?: string
  valid?: boolean
}

export default function TextInput({ error, valid, ...props }: TextInputProps) {
  return (
    <View>
      <View className='relative'>
        <RNTextInput
          className={clsx(
            'border rounded-full py-3 px-5 focus:border-orange-500',
            error ? 'border-red-500' : 'border-gray-300'
          )}
          {...props}
        />
        {valid ? (<View className="absolute top-1/2 -translate-y-1/2 right-5">
          <SymbolView name='checkmark' size={22} tintColor="#007BFE" />
        </View>) : null}
      </View>
      <View className="mt-0.5 min-h-[18px]">
        <Text className="text-red-accent text-sm">{error}</Text>
      </View>
    </View>
  )
}
