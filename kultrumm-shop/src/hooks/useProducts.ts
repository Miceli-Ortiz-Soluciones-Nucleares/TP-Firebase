import { useCallback, useEffect, useState } from 'react'
import type { Producto } from '../types'
import * as svc from '../services/products.service'

export const useProducts = () => {
  const [products, setProducts] = useState<Producto[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await svc.getProducts()
      setProducts(data)
    } catch {
      setError('No se pudo cargar el catálogo. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const createProduct = async (data: Omit<Producto, 'id' | 'creadoEn' | 'actualizadoEn'>) => {
    await svc.createProduct(data)
    await load()
  }

  const updateProduct = async (id: string, data: Partial<Omit<Producto, 'id' | 'creadoEn'>>) => {
    await svc.updateProduct(id, data)
    await load()
  }

  const deleteProduct = async (id: string) => {
    await svc.deleteProduct(id)
    await load()
  }

  return { products, loading, error, refetch: load, createProduct, updateProduct, deleteProduct }
}
