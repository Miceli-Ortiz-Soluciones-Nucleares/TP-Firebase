import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { signIn, signOut } from '../../services/auth.service'

export const LoginPage = () => {
  const { isAdmin, loading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  // Si ya está autenticado como admin → redirigir
  if (!loading && isAdmin) return <Navigate replace to="/admin" />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const cred = await signIn(email, password)
      const token = await cred.user.getIdTokenResult()

      if (token.claims['admin'] !== true) {
        await signOut()
        setError('Acceso denegado: no tiene permisos de administrador.')
        setSubmitting(false)
        return
      }

      void navigate('/admin')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setError('Email o contraseña incorrectos.')
      } else {
        setError('Ocurrió un error. Intentá de nuevo.')
      }
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm border border-neutral-800 bg-[#1a1a1a] p-8">
        {/* Cabecera */}
        <div className="mb-8 border-b border-neutral-800 pb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-[#8a8a8a] mb-1">
            Panel de administración
          </p>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#f3f3f3]">
            Ingresar
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="font-mono text-xs text-[#8a8a8a]">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border border-neutral-800 bg-[#121212] px-3 py-2 font-sans text-sm text-[#f3f3f3] outline-none focus:border-neutral-600 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="font-mono text-xs text-[#8a8a8a]">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="border border-neutral-800 bg-[#121212] px-3 py-2 font-sans text-sm text-[#f3f3f3] outline-none focus:border-neutral-600 transition-colors"
            />
          </div>

          {error && (
            <p className="font-mono text-xs text-[#dd3b3b]">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 bg-[#dd3b3b] py-3 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Ingresando…</span>
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
