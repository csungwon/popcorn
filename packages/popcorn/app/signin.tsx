import Button from '@/components/Button'
import TextInput from '@/components/TextInput'
import { useAuth } from '@/context/AuthContext'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Redirect } from 'expo-router'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { Keyboard, Text, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { z } from 'zod'

const signInSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address'),
  password: z.string({ required_error: 'Password is required' })
})

export type SignInFields = z.infer<typeof signInSchema>

export default function SignInScreen() {
  const { signIn, signInWithGoogle, accessToken } = useAuth()
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError
  } = useForm({
    resolver: zodResolver(signInSchema)
  })

  const onSubmit: SubmitHandler<SignInFields> = async (data) => {
    try {
      await signIn(data)
    } catch (error) {
      console.error('Error occurred during form submission:', error)
      setError('root', { type: 'manual', message: 'Failed to sign in. Please check your credentials' })
    }
  }

  // If the user is already signed in, redirect them to the search page
  if (accessToken) {
    return <Redirect href="/(tabs)/search" />
  }

  // Log the errors to the console for debugging
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView className="px-4 py-5 bg-white inset-0 absolute">
        <Text className="text-3xl font-bold">Sign in</Text>
        <View>
          <View className="mt-7 flex flex-col gap-3">
            <View>
              <Text className="mb-1.5">Email</Text>
              <Controller
                control={control}
                name="email"
                rules={{ required: true }}
                render={({
                  field: { onChange, onBlur, value },
                  formState: { errors }
                }) => (
                  <TextInput
                    placeholder="Your email"
                    keyboardType="email-address"
                    onChangeText={onChange}
                    autoCapitalize="none"
                    onBlur={onBlur}
                    value={value}
                    error={errors.email?.message}
                  />
                )}
              />
            </View>
            <View>
              <View className="mb-1.5 flex flex-row justify-between items-center">
                <Text>Password</Text>
                {/* TODO: implement forgot password link flow */}
                {/*
                <Link asChild href="/forgot-password">
                  <Text className="text-sm text-blue-800">Forgot password?</Text>
                </Link> */}
              </View>
              <Controller
                control={control}
                name="password"
                render={({
                  field: { onChange, onBlur, value },
                  formState: { errors }
                }) => (
                  <TextInput
                    placeholder="Enter your password"
                    secureTextEntry
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={errors.password?.message}
                  />
                )}
              />
            </View>
          </View>
          {/* General sign in failure message */}
          <View>
            <Text className="text-red-accent text-sm">
              {errors.root?.message}
            </Text>
          </View>
        </View>
        <Button
          className="mt-5 disabled:bg-gray-200"
          onPress={handleSubmit(onSubmit)}
          label={isSubmitting ? 'Signing in...' : 'Sign in'}
          disabled={isSubmitting}
        />
        <View className="mt-8 flex flex-row items-center justify-between">
          <View className="h-[1px] bg-black/20 flex-grow" />
          <Text className="align-middle text-gray-600 mx-3">or</Text>
          <View className="h-[1px] bg-black/20 flex-grow" />
        </View>
        <View className="mt-2 flex flex-col gap-2.5">
          <Button
            type="tertiary"
            label="Continue with Google"
            onPress={signInWithGoogle}
            iconSource={require('@/assets/images/google-icon.png')}
          />
          {/* Sign in with Facebook. Add once facebook integration is ready */}
          {/* <Button
            type="tertiary"
            label="Continue in with Facebook"
            onPress={() => {
              alert('Sign with Facebook pressed')
            }}
            iconSource={require('@/assets/images/facebook-icon.png')}
          /> */}
        </View>
        <View className="mt-5">
          <Text className="text-center text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="ml-1 text-black font-bold">
              Sign up
            </Link>
          </Text>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}
