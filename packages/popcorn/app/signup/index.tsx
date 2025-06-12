import { SignUpFields } from '@/app/signup/_layout'
import SignUpLayout from '@/components/auth/SignUpLayout'
import Button from '@/components/Button'
import TextInput from '@/components/TextInput'
import { useRouter } from 'expo-router'
import { Controller, useFormContext } from 'react-hook-form'
import { Text, View } from 'react-native'

export default function SignUpNameScreen() {
  const { control, trigger } = useFormContext<SignUpFields>()
  const router = useRouter()

  return (
    <SignUpLayout>
      <View className="flex flex-col gap-3">
        <View>
          <Text className="mb-1.5">First Name</Text>
          <Controller
            control={control}
            name="firstName"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error }
            }) => (
              <TextInput
                placeholder="Your first name"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={error?.message}
              />
            )}
          />
        </View>
        <View>
          <Text className="mb-1.5">Last Name</Text>
          <Controller
            control={control}
            name="lastName"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error }
            }) => (
              <TextInput
                placeholder="Your last name"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={error?.message}
              />
            )}
          />
        </View>
      </View>
      <Button
        className="mt-4"
        label="Next"
        onPress={async () => {
          const isValid = await trigger(['firstName', 'lastName'])
          if (isValid) {
            router.push('/signup/email-password')
          }
        }}
      />
    </SignUpLayout>
  )
}
