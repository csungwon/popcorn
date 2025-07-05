import { Image, ImageProps } from 'expo-image'
import { useState } from 'react'

type ImageWithFallbackProps = ImageProps & {
  fallbackSource: ImageProps['source']
}

export default function ImageWithFallback({
  source,
  fallbackSource,
  ...props
}: ImageWithFallbackProps) {
  const [imageSource, setImageSource] = useState(source ?? fallbackSource)

  return (
    <Image
      {...props}
      source={imageSource}
      onError={() => setImageSource(fallbackSource)}
    />
  )
}
