import clsx from 'clsx'
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  Text,
  View
} from 'react-native'

type TextInputProps = RNTextInputProps & {
  error?: string
}

export default function TextInput({ error, ...props }: TextInputProps) {
  return (
    <View>
      <RNTextInput
        className={clsx(
          'border rounded-full py-3 px-5 focus:border-orange-500',
          error ? 'border-red-500' : 'border-gray-300'
        )}
        {...props}
      />
      <View className="mt-1.5 min-h-[18px]">
        <Text className="text-red-accent text-sm">{error}</Text>
      </View>
    </View>
  )
}
