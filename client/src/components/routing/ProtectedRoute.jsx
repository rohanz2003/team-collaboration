import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { ROUTES } from '../../constants/routes'

export default function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return children
}
