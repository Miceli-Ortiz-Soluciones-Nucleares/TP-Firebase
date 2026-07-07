import { useEffect, useState } from 'react'
import type { Compra } from '../types'
import { subscribeToOrders } from '../services/orders.service'

export const useOrders = () => {
  const [orders, setOrders]   = useState<Compra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToOrders(data => {
      setOrders(data)
      setLoading(false)
    })
    return () => {
      unsubscribe()
      setError(null)
    }
  }, [])

  return { orders, loading, error }
}
