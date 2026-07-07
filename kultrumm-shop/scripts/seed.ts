/**
 * seed.ts
 * ─────────────────────────────────────────────────────────
 * Carga el producto de prueba inicial en Firestore.
 * Solo debe ejecutarse UNA vez cuando la colección /productos está vacía.
 *
 * USO:
 *   1. Asegurarse de que scripts/serviceAccountKey.json existe.
 *   2. Ejecutar desde la raíz del proyecto:
 *      npx ts-node scripts/seed.ts
 */

import * as admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const serviceAccountPath = resolve(__dirname, 'serviceAccountKey.json')
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8')) as admin.ServiceAccount

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()

const producto = {
  nombre:           'Compresor de Prueba Bauhaus v1',
  descripcionCorta: 'Compresor estéreo de tubos. Respuesta trasiente precisa.',
  descripcionLarga:
    'Unidad de prueba para validar el flujo completo del catálogo. Replica el comportamiento de un compresor de válvulas de alta fidelidad con controles de ataque y release escalonados.',
  precio: 450000,
  especificaciones: {
    Tipo:                    'VCA / Válvulas',
    Válvulas:                '2× ECC83',
    Ratio:                   '2:1 — 20:1',
    Ataque:                  '0.1ms — 300ms',
    Release:                 '50ms — 2s',
    'Impedancia entrada':    '10 kΩ',
    'Respuesta en frecuencia': '20Hz — 20kHz ±0.5dB',
    Alimentación:            '110/220V AC',
  },
  imagen: 'https://placehold.co/600x400/1a1a1a/f3f3f3?text=BAUHAUS+COMP+v1',
  creadoEn:      admin.firestore.FieldValue.serverTimestamp(),
  actualizadoEn: admin.firestore.FieldValue.serverTimestamp(),
}

async function seed() {
  const col = db.collection('productos')
  const snap = await col.limit(1).get()

  if (!snap.empty) {
    console.log('⚠️  La colección /productos ya tiene documentos. Seeding omitido.')
    process.exit(0)
  }

  await col.add(producto)
  console.log('✅  Producto de prueba cargado en /productos.')
  process.exit(0)
}

seed().catch((err: unknown) => {
  console.error('❌  Error en seeding:', err)
  process.exit(1)
})
