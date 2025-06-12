import { SignUpFields } from '@/app/signup/_layout'
import SignUpLayout from '@/components/auth/SignUpLayout'
import Button from '@/components/Button'
import TextInput from '@/components/TextInput'
import { SignUpError, useAuth } from '@/context/AuthContext'
import { Controller, useFormContext } from 'react-hook-form'
import { Text, View } from 'react-native'

export default function SignUpEmailPasswordScreen() {
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, isValidating }
  } = useFormContext<SignUpFields>()
  const { signUp } = useAuth()

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signUp(data)
    } catch (error) {
      const { message, code } = error as SignUpError
      if (code === 400) {
        setError('email', { type: 'manual', message })
      }
      console.error('Error occurred during form submission:', error)
      setError('root', { type: 'manual', message })
    }
  })

  return (
    <SignUpLayout>
      <View className="flex flex-col gap-3">
        <View>
          <Text className="mb-1.5">Email</Text>
          <Controller
            control={control}
            name="email"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error, isTouched }
            }) => (
              <TextInput
                autoCapitalize="none"
                placeholder="Email"
                editable={!isSubmitting}
                selectTextOnFocus={!isSubmitting}
                keyboardType="email-address"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={error?.message}
                valid={isTouched && !error}
              />
            )}
          />
        </View>
        <View>
          <Text className="mb-1.5">Password</Text>
          <Controller
            control={control}
            name="password"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error, isTouched }
            }) => (
              <TextInput
                placeholder="6 characters or more"
                secureTextEntry
                onChangeText={onChange}
                editable={!isSubmitting}
                selectTextOnFocus={!isSubmitting}
                onBlur={onBlur}
                value={value}
                error={error?.message}
                valid={isTouched && !error}
              />
            )}
          />
        </View>
      </View>
      <Button
        className="mt-4"
        label={isSubmitting ? 'Signing up...' : 'Sign up'}
        disabled={isSubmitting}
        onPress={onSubmit}
      />
    </SignUpLayout>
  )
}
