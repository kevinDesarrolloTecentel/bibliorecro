import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store'
import type { UserData } from '../../models/auth'
import { isSessionValid, clearAuthSession } from '../../utils/auth'
import { sessionExpired } from '../../authSlice'
import Page403 from '@/views/pages/Errors/Page403'
import { usePermissions } from '@/context/PermissionsContext'
import { CSpinner } from '@coreui/react-pro'

interface ProtectedRouteProps {
  children?: React.ReactNode
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
}) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const user = useSelector((state: RootState) => state.auth.user) as UserData | null
  const { canAccessPath, permisosCargados, esAdmin } = usePermissions()

  useEffect(() => {
    if (!isAuthenticated) return

    const verificarExpiracion = () => {
      if (!isSessionValid(user)) {
        clearAuthSession()
        dispatch(sessionExpired())
        if (!window.location.hash.includes('#/login')) {
          window.location.hash = '#/login?session_expired=true'
        }
      }
    }

    verificarExpiracion()
    const interval = setInterval(verificarExpiracion, 5000)

    return () => clearInterval(interval)
  }, [isAuthenticated, user, dispatch])

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // Si los permisos iniciales aún no terminan de cargar y no hay caché ni es admin, mostrar spinner (NUNCA 403)
  if (!permisosCargados && !esAdmin) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  // Si no es la ruta base "/" y no tiene permiso en la BD para este path
  const currentPath = location.pathname.split('?')[0].replace(/\/+$/, '') || '/'
  if (currentPath !== '/' && !canAccessPath(currentPath)) {
    return <Page403 />
  }

  return <>{children}</>
}

export default ProtectedRoute
