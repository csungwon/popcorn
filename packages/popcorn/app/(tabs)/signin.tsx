import { StyleSheet, Text, View, TouchableOpacity, Button } from 'react-native'
import {
  GoogleSignin,
  User
} from '@react-native-google-signin/google-signin'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignInScreen() {
  const [userInfo, setUserInfo] = useState<User | null>(null)

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
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
    <SafeAreaView style={styles.container}>
      {userInfo ? (
        <View
          style={{
            gap: 16,
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <Image
            source={{ uri: userInfo.user?.photo }}
            style={{ width: 80, height: 80, borderRadius: '50%' }}
          />
          <View style={{ flex: 1, gap: 8, justifyContent: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 500 }}>
              {userInfo.user.name}
            </Text>
            <Text style={{ fontSize: 16 }}>{userInfo.user.email}</Text>
          </View>
        </View>
      ) : (
        <Text style={{ fontSize: 24, textAlign: 'center' }}>
          Please sign in to see user information
        </Text>
      )}
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Image
          source={require('@/assets/images/google-icon.png')}
          style={styles.googleIcon}
        />
        <Text style={styles.buttonLabel}>Continue with Google</Text>
      </TouchableOpacity>
      <Button
        title="Clear Local Storage"
        onPress={() => {
          AsyncStorage.removeItem('@user')
          setUserInfo(null)
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  button: {
    marginTop: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontSize: 20,
    textAlign: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    position: 'absolute',
    left: 16,
  },
})
