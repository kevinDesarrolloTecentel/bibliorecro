import React, { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store'
import type { UserData } from '../../models/auth'
import { hasRequiredRole, isSessionValid, clearAuthSession, RoleIdentifier } from '../../utils/auth'
import { sessionExpired } from '../../authSlice'
import Page403 from '@/views/pages/Errors/Page403'

export const hasPermission = (
  user: any,
  allowedRoles?: RoleIdentifier[],
): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) return true
  if (!user) return false
  const userRole = user.ID_ROL ?? user.rol ?? user.id_rol
  return hasRequiredRole(userRole, allowedRoles)
}

interface ProtectedRouteProps {
  children?: React.ReactNode
  roles?: RoleIdentifier[]
  redirectTo?: string
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
  redirectTo = '/login',
  fallback,
}) => {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const user = useSelector((state: RootState) => state.auth.user) as UserData | null

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

  if (!isSessionValid(user)) {
    return <Navigate to={`${redirectTo}?session_expired=true`} replace />
  }

  if (roles && roles.length > 0) {
    const isAuthorized = hasPermission(user, roles)
    if (!isAuthorized) {
      return fallback ? <>{fallback}</> : <Page403 />
    }
  }

  return children ? <>{children}</> : <Outlet />
}

export default ProtectedRoute
