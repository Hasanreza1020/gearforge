import { Suspense } from 'react'
import OrdersList from './OrdersList'
import LoadingScanner from '@/components/ui/LoadingScanner'

export default function OrdersPage() {
  return (
    <Suspense fallback={<LoadingScanner message="LOADING MISSIONS" />}>
      <OrdersList />
    </Suspense>
  )
}
