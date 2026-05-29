import { Suspense } from 'react'
import LoginForm from './LoginForm'
import LoadingScanner from '@/components/ui/LoadingScanner'

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScanner message="LOADING" />}>
      <LoginForm />
    </Suspense>
  )
}
