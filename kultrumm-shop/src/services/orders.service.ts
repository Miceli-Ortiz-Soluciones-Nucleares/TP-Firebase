import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Compra, CompraItem } from '../types'

const COL = 'compras'

export interface CreateOrderPayload {
  transaccionId: string
  items: CompraItem[]
  total: number
  estado: 'simulado'
}

export const createOrder = (payload: CreateOrderPayload) =>
  addDoc(collection(db, COL), {
    ...payload,
    creadoEn: serverTimestamp(),
  })

export const subscribeToOrders = (
  callback: (orders: Compra[]) => void,
): Unsubscribe => {
  const q = query(collection(db, COL), orderBy('creadoEn', 'desc'))
  return onSnapshot(q, snap => {
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Compra))
    callback(orders)
  })
}
