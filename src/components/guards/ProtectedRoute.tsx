import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store'
import type { UserData } from '../../models/auth'
import { isSessionValid, isUserActive, clearAuthSession } from '../../utils/auth'
import { sessionExpired } from '../../authSlice'
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
  const { canAccessPath, permisosCargados, rutasPermitidas } = usePermissions()

  // Si no es la ruta base "/" y no tiene permiso en la BD para este path
  const currentPath = location.pathname.split('?')[0].replace(/\/+$/, '') || '/'

  // Recordar la ruta válida en la que está actualmente el usuario
  useEffect(() => {
    if (isAuthenticated && permisosCargados && (currentPath === '/' || canAccessPath(currentPath))) {
      try {
        sessionStorage.setItem('last_valid_route', currentPath)
      } catch { }
    }
  }, [isAuthenticated, permisosCargados, currentPath, canAccessPath])

  useEffect(() => {
    if (!isAuthenticated) return

    const verificarExpiracion = () => {
      // Verificación en memoria local (0 peticiones de red)
      if (!isSessionValid(user)) {
        clearAuthSession()
        dispatch(sessionExpired())
        if (!window.location.hash.includes('#/login')) {
          const isInactive = !isUserActive(user)
          window.location.replace(`/#/login?${isInactive ? 'user_inactive=true' : 'session_expired=true'}`)
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

  // Si los permisos iniciales aún no terminan de cargar, mostrar spinner (NUNCA 403)
  if (!permisosCargados) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  // Si el usuario intenta entrar a una ruta no permitida, redirigirlo a la ruta en la que estaba
  if (currentPath !== '/' && !canAccessPath(currentPath)) {
    let fallback = '/dashboard'
    try {
      const last = sessionStorage.getItem('last_valid_route')
      if (last && last !== currentPath && canAccessPath(last)) {
        fallback = last
      } else if (canAccessPath('/dashboard')) {
        fallback = '/dashboard'
      } else if (rutasPermitidas && rutasPermitidas.size > 0) {
        const first = Array.from(rutasPermitidas)[0]
        if (first && first !== currentPath) {
          fallback = first
        }
      }
    } catch { }

    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
