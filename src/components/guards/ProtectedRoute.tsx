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
  const { canAccessPath, permisosCargados, loadingPermisos, rutasPermitidas } = usePermissions()

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

    // Pequeño margen al montar para evitar expulsiones falsas en el primer tick de renderizado
    const timeoutId = setTimeout(verificarExpiracion, 1500)
    const interval = setInterval(verificarExpiracion, 5000)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(interval)
    }
  }, [isAuthenticated, user, dispatch])

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // Mientras los permisos se están cargando o sincronizando, mostrar el spinner
  if (!permisosCargados || loadingPermisos) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  // Si ya cargaron los permisos pero el rol no tiene ninguna pantalla asignada en la BD
  if (rutasPermitidas.size === 0) {
    clearAuthSession()
    dispatch(sessionExpired())
    return <Navigate to="/login" replace />
  }

  // Si el usuario intenta entrar a una ruta no permitida, redirigirlo a la siguiente ruta válida de la BD
  if (currentPath !== '/' && !canAccessPath(currentPath)) {
    let siguienteRuta = ''

    try {
      // 1. Intentar con la última ruta válida que tenía si aún tiene acceso a ella
      const last = sessionStorage.getItem('last_valid_route')
      if (last && last !== currentPath && canAccessPath(last)) {
        siguienteRuta = last
      }

      // 2. Tomar la primera ruta disponible en las rutas permitidas de su rol (directamente desde la base de datos)
      if (!siguienteRuta && rutasPermitidas && rutasPermitidas.size > 0) {
        const anyPermitted = Array.from(rutasPermitidas).find((r) => r !== currentPath && canAccessPath(r))
        if (anyPermitted) {
          siguienteRuta = anyPermitted
        }
      }
    } catch { }

    // Si tiene una siguiente ruta permitida, redirigirlo automáticamente a ella
    if (siguienteRuta && siguienteRuta !== currentPath) {
      return <Navigate to={siguienteRuta} replace />
    }

    if (rutasPermitidas.size > 0) {
      const first = Array.from(rutasPermitidas)[0]
      if (first && first !== currentPath) {
        return <Navigate to={first} replace />
      }
    }

    // Si no tiene ninguna ruta asignada en el sistema, sacarlo al login
    clearAuthSession()
    dispatch(sessionExpired())
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
