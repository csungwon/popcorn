import { Link } from 'expo-router'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'

export default function NotFoundScreen() {
  return (
    <ThemedView className="flex flex-1 items-center justify-center p-5">
      <ThemedText type="title">This screen does not exist.</ThemedText>
      <Link href="/" className="mt-4 py-4">
        <ThemedText type="link">Go to home screen!</ThemedText>
      </Link>
    </ThemedView>
  )
}
