import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { usePermissions } from '@/context/PermissionsContext'

export const NotFoundRedirect: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const { canAccessPath, rutasPermitidas } = usePermissions()

  if (typeof window !== 'undefined' && window.location.pathname && window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
    window.history.replaceState(null, '', `/${window.location.hash || '#/'}`)
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  let fallback = '/dashboard'
  try {
    const last = typeof window !== 'undefined' ? sessionStorage.getItem('last_valid_route') : null
    if (last && canAccessPath(last)) {
      fallback = last
    } else if (canAccessPath('/dashboard')) {
      fallback = '/dashboard'
    } else if (rutasPermitidas && rutasPermitidas.size > 0) {
      const first = Array.from(rutasPermitidas)[0]
      if (first) {
        fallback = first
      }
    }
  } catch { }

  return <Navigate to={fallback} replace />
}

export default NotFoundRedirect

