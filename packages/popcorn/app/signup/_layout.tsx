import { zodResolver } from '@hookform/resolvers/zod'
import { Stack } from 'expo-router'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

const signUpSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required' })
    .min(1, 'First name is required'),
  lastName: z
    .string({ required_error: 'Last name is required' })
    .min(1, 'Last name is required'),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long')
    .max(20, 'Password must be at most 20 characters long')
})

export type SignUpFields = z.infer<typeof signUpSchema>

export default function SignUpLayout() {
  const methods = useForm({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: ''
    }
  })
  return (
    <FormProvider {...methods}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="email-password" />
      </Stack>
    </FormProvider>
  )
}
