import axios from 'axios'
import Constants from 'expo-constants'

function getMicrowaveBaseURL() {
  const expoHostUri = Constants.expoConfig?.hostUri
  if (expoHostUri) {
    const hostName = expoHostUri.split(':')[0]
    return `http://${hostName}:3000`
  } else {
    throw new Error('Expo host URI is not defined in the app configuration.')
  }
}

const microwaveAxiosInstance = axios.create({
  baseURL: process.env.MICROWAVE_API_URL || getMicrowaveBaseURL()
})

export default microwaveAxiosInstance
