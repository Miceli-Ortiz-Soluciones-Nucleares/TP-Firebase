import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LoadingSpinner } from '../ui/LoadingSpinner'

export const ProtectedRoute = () => {
  const { isAdmin, loading } = useAuth()

  if (loading) return <LoadingSpinner fullscreen />
  if (!isAdmin) return <Navigate replace to="/login" />
  return <Outlet />
}
