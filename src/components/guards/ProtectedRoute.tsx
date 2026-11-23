import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store'
import type { UserData } from '@/slices/authSlice'
import { isSessionValid, isUserActive, clearAuthSession } from '../../utils/auth'
import { sessionExpired } from '@/slices/authSlice'
import { usePermissions, normalizePath } from '@/hooks/auth/usePermissions'
import { CSpinner } from '@coreui/react-pro'
import Page403 from '@/views/pages/Errors/Page403'

interface ProtectedRouteProps {
  children?: React.ReactNode
  redirectTo?: string
  requiredPermission?: string
  requiredRoles?: string[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
  requiredPermission,
  requiredRoles,
}) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const user = useSelector((state: RootState) => state.auth.user) as UserData | null
  const {
    canAccessPath,
    hasPermission,
    hasAnyRole,
    permisosCargados,
    loadingPermisos,
    rutasPermitidas,
    recargarPermisos,
  } = usePermissions()

  const currentPath = location.pathname.split('?')[0].replace(/\/+$/, '') || '/'
  const normalizedPath = normalizePath(currentPath)

  useEffect(() => {
    if (isAuthenticated && !permisosCargados) {
      recargarPermisos()
    }
  }, [isAuthenticated, permisosCargados, recargarPermisos])

  // Recordar la ruta válida en la que está actualmente el usuario
  useEffect(() => {
    if (isAuthenticated && permisosCargados) {
      const isAllowed = requiredPermission
        ? hasPermission(requiredPermission)
        : normalizedPath === '/' || canAccessPath(normalizedPath)

      if (isAllowed) {
        try {
          sessionStorage.setItem('last_valid_route', normalizedPath)
        } catch {}
      }
    }
  }, [isAuthenticated, permisosCargados, normalizedPath, requiredPermission, hasPermission, canAccessPath])

  useEffect(() => {
    if (!isAuthenticated) return

    const verificarExpiracion = () => {
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

  // 1. Verificación declarativa por roles (si están configurados)
  if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Page403 />
  }

  // 2. Verificación declarativa por permiso (si está configurado)
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Page403 />
  }

  // 3. Fallback: Verificación de ruta si no se declaró permiso explícito
  if (!requiredPermission && normalizedPath !== '/' && !canAccessPath(normalizedPath)) {
    return <Page403 />
  }

  return <>{children}</>
}

export default ProtectedRoute
