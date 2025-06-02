import AsyncStorage from '@react-native-async-storage/async-storage'
import { GoogleSignin, User } from '@react-native-google-signin/google-signin'
import { Image } from 'expo-image'
import { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignInScreen() {
  const [userInfo, setUserInfo] = useState<User | null>(null)

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
    })
  }, [])

  async function handleSignIn() {
    const user = await AsyncStorage.getItem('@user')
    if (!user) {
      try {
        await GoogleSignin.hasPlayServices()
        const userSigninResponse = await GoogleSignin.signIn()
        if (userSigninResponse.type === 'success') {
          const userInfo = userSigninResponse.data
          await AsyncStorage.setItem('@user', JSON.stringify(userInfo))
          setUserInfo(userInfo)
        } else {
          alert('sign in failed')
        }
      } catch (error) {
        console.log(error)
        alert('Something happened')
      }
    } else {
      setUserInfo(JSON.parse(user))
    }
  }

  console.log(userInfo)
  return (
    <SafeAreaView className="flex flex-1 px-5 bg-white justify-center">
      {userInfo ? (
        <View className="flex flex-row gap-4 justify-center">
          {userInfo.user?.photo && (
            <Image
              source={{ uri: userInfo.user.photo }}
              className="w-20 h-20 rounded-full"
            />
          )}
          <View className="flex-1 gap-2 justify-center">
            <Text className="text-2xl font-medium">
              {userInfo.user.name}
            </Text>
            <Text className="text-base">{userInfo.user.email}</Text>
          </View>
        </View>
      ) : (
        <Text className="text-2xl text-center">
          Please sign in to see user information
        </Text>
      )}
      <TouchableOpacity
        className="mt-20 px-4 py-3 rounded-full bg-gray-100 w-full flex flex-row justify-center items-center"
        onPress={handleSignIn}
      >
        <Image
          source={require('@/assets/images/google-icon.png')}
          className="w-6 h-6 absolute left-4"
        />
        <Text className="text-xl">Continue with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          AsyncStorage.removeItem('@user')
          setUserInfo(null)
        }}
      >
        <Text className="text-xl text-blue-600 p-4 text-center">Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}
