import { useAuth } from '@/context/AuthContext'
import { Link } from 'expo-router'
import React, { PropsWithChildren } from 'react'
import { Keyboard, Text, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Button from '../Button'

export default function SignUpLayout({ children }: PropsWithChildren) {
  const { signInWithGoogle } = useAuth()
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView className="bg-white px-4 py-5 absolute inset-0">
        <Text className="text-3xl font-bold mb-7">Sign Up</Text>
        {children}
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
        </View>
        <View>
          <Text className="mt-5 text-center text-gray-600">
            Already have an account?{' '}
            <Link href="/signin" className="ml-1 text-black font-bold" push>
              Sign in
            </Link>
          </Text>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}
