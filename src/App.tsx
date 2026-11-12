
import React, {
  Suspense,
  useEffect,
  useRef,
} from 'react'

import {
  HashRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'

import { useSelector } from 'react-redux'
import { CSpinner, useColorModes } from '@coreui/react-pro'

import './scss/style.scss'
import './scss/tailwind.scss'

import type { RootState } from './store'

import PublicRoute from './components/guards/PublicRoute'
import ProtectedRoute from './components/guards/ProtectedRoute'

import {
  PermissionsProvider,
  usePermissions,
} from './context/PermissionsContext'

// Containers
const DefaultLayout = React.lazy(
  () => import('./layout/DefaultLayout'),
)

const NotFoundRedirect = React.lazy(
  () => import('./components/guards/NotFoundRedirect'),
)

const Login = React.lazy(
  () => import('./views/pages/login/Login'),
)

const Page405 = React.lazy(
  () => import('./views/pages/Errors/Page405'),
)

const Page500 = React.lazy(
  () => import('./views/pages/Errors/Page500'),
)

// Limpiar URL
const UrlSanitizer = () => {
  const location = useLocation()

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.location.pathname &&
      window.location.pathname !== '/' &&
      window.location.pathname !== '/index.html'
    ) {
      window.history.replaceState(
        null,
        '',
        `/${window.location.hash || '#/'}`,
      )
    }
  }, [location])

  return null
}

// ============================================
// SINCRONIZADOR AUTOMÁTICO DE PERMISOS
// ============================================

const SincronizadorPermisos = () => {
  const location = useLocation()

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  )

  const { recargarPermisos } = usePermissions()
  const lastSyncPathRef = useRef<string>('')
  const lastSyncTimeRef = useRef<number>(0)

  // Al navegar a cualquier ruta, consultar mis-permisos con un control de frecuencia para evitar saturación del servidor
  useEffect(() => {
    if (!isAuthenticated) return
    if (location.pathname === '/login') return

    const now = Date.now()
    const isSamePath = lastSyncPathRef.current === location.pathname
    const elapsed = now - lastSyncTimeRef.current

    // Evitar saturar el backend si es la misma ruta y pasaron menos de 10s, o si navegó entre rutas pero pasaron menos de 1.5s
    if ((isSamePath && elapsed < 10000) || (!isSamePath && elapsed < 1500)) {
      return
    }

    lastSyncPathRef.current = location.pathname
    lastSyncTimeRef.current = now
    void recargarPermisos(true)
  }, [location.pathname, isAuthenticated, recargarPermisos])

  return null
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes(
    'coreui-pro-react-admin-template-theme-default',
  )

  const storedTheme = useSelector(
    (state: RootState) => state.ui.theme,
  )

  useEffect(() => {
    const urlParams = new URLSearchParams(
      window.location.href.split('?')[1],
    )

    let theme = urlParams.get('theme')

    if (
      theme !== null &&
      theme.match(/^[A-Za-z0-9\s]+/)
    ) {
      theme = theme.match(/^[A-Za-z0-9\s]+/)![0]
    }

    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HashRouter>
      <UrlSanitizer />

      <PermissionsProvider>
        {/* Actualización automática de permisos */}
        <SincronizadorPermisos />

        <Suspense
          fallback={
            <div className="pt-3 text-center">
              <CSpinner
                color="primary"
                variant="grow"
              />
            </div>
          }
        >
          <Routes>
            {/* Login */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Status & Error Pages */}
            <Route
              path="/403"
              element={<NotFoundRedirect />}
            />

            <Route
              path="/404"
              element={<NotFoundRedirect />}
            />

            <Route
              path="/405"
              element={<Page405 />}
            />

            <Route
              path="/500"
              element={<Page500 />}
            />

            {/* Main Protected Layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <DefaultLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </PermissionsProvider>
    </HashRouter>
  )
}

export default App
