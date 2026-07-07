import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Producto } from '../types'

const COL = 'productos'

export const getProducts = async (): Promise<Producto[]> => {
  const q = query(collection(db, COL), orderBy('creadoEn', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Producto))
}

export const createProduct = (data: Omit<Producto, 'id' | 'creadoEn' | 'actualizadoEn'>) =>
  addDoc(collection(db, COL), {
    ...data,
    creadoEn:      serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  })

export const updateProduct = (id: string, data: Partial<Omit<Producto, 'id' | 'creadoEn'>>) =>
  updateDoc(doc(db, COL, id), {
    ...data,
    actualizadoEn: serverTimestamp(),
  })

export const deleteProduct = (id: string) =>
  deleteDoc(doc(db, COL, id))
