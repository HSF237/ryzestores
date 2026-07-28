import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

/**
 * ProtectedStaffRoute — wraps any route that should only be accessible
 * to users with role === 'staff' or role === 'admin'.
 * Redirects unauthenticated users to /login, unauthorised users to /.
 */
export default function ProtectedStaffRoute({ children }) {
  const { user, loading } = useAuth()

  // Still loading auth state — render nothing to avoid flash
  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

  if (user.role !== 'staff' && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}
