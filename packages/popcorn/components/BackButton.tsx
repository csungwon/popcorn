import clsx from 'clsx'
import { useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { Pressable } from 'react-native'

type BackButtonProps = {
  className?: string
  onPress?: () => void
}

export default function BackButton({ className, onPress }: BackButtonProps) {
  const router = useRouter()

  return (
    <Pressable
      onPress={onPress ?? router.back}
      className={clsx(
        'w-10 h-10 items-center justify-center rounded-full bg-white shadow-md',
        className
      )}
      hitSlop={10}
    >
      <SymbolView name="arrow.left" size={22} tintColor="#1c1c1c" />
    </Pressable>
  )
}
