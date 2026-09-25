import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { isSessionValid } from '../../utils/auth'
import { UserData } from '@/models/auth'

interface PublicRouteProps {
  children?: React.ReactNode
  defaultRedirect?: string
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  defaultRedirect = '/dashboard',
}) => {
  const location = useLocation()
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const user = useSelector((state: RootState) => state.auth.user) as UserData | null

  const isCurrentlyValid = isAuthenticated && isSessionValid(user)

  if (isCurrentlyValid) {
    const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || defaultRedirect
    return <Navigate to={from} replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export default PublicRoute
