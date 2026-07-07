/**
 * set-admin-claim.ts
 * ─────────────────────────────────────────────────────────
 * Script ONE-TIME para asignar el Custom Claim { admin: true }
 * al usuario administrador de Firebase Auth.
 *
 * USO:
 *   1. Descargar serviceAccountKey.json desde:
 *      Firebase Console → Configuración del proyecto → Cuentas de servicio
 *      → Generar nueva clave privada
 *   2. Colocar el archivo en scripts/serviceAccountKey.json
 *   3. Ejecutar:
 *      npx ts-node scripts/set-admin-claim.ts <UID_DEL_ADMIN>
 *
 * IMPORTANTE: scripts/serviceAccountKey.json está en .gitignore — nunca commitear.
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

const uid = process.argv[2]

if (!uid) {
  console.error('❌  Uso: npx ts-node scripts/set-admin-claim.ts <UID_DEL_ADMIN>')
  process.exit(1)
}

const serviceAccountPath = resolve(__dirname, 'serviceAccountKey.json')
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))

initializeApp({ credential: cert(serviceAccount) })

getAuth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`✅  Custom claim { admin: true } asignado al UID: ${uid}`)
    console.log('    Cerrá sesión y volvé a iniciarla para que el token se actualice.')
    process.exit(0)
  })
  .catch((err: unknown) => {
    console.error('❌  Error:', err)
    process.exit(1)
  })
