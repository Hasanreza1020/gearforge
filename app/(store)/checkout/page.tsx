import { Suspense } from 'react'
import CheckoutForm from './CheckoutForm'
import LoadingScanner from '@/components/ui/LoadingScanner'

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingScanner message="LOADING CHECKOUT" />}>
      <CheckoutForm />
    </Suspense>
  )
}
