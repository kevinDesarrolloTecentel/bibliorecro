
import React, {
  Suspense,
  useEffect,
} from 'react'

import {
  HashRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'

import { CSpinner, } from '@coreui/react-pro'

import './scss/style.scss'
import './scss/tailwind.scss'


import PublicRoute from './components/guards/PublicRoute'
import ProtectedRoute from './components/guards/ProtectedRoute'

// Containers
const DefaultLayout = React.lazy(
  () => import('./layout/DefaultLayout'),
)

import Page403 from './views/pages/Errors/Page403'
import Page404 from './views/pages/Errors/Page404'

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

const App = () => {
  return (
    <HashRouter>
      <UrlSanitizer />

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
            element={<Page403 />}
          />

          <Route
            path="/404"
            element={<Page404 />}
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
    </HashRouter>
  )
}

export default App
