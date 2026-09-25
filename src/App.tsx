import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react-pro'

import './scss/style.scss'
import './scss/tailwind.scss'

import type { RootState } from './store'
import PublicRoute from './components/guards/PublicRoute'
import ProtectedRoute from './components/guards/ProtectedRoute'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

const Login = React.lazy(() => import('./views/pages/login/Login'))
const Page403 = React.lazy(() => import('./views/pages/Errors/Page403'))
const Page404 = React.lazy(() => import('./views/pages/Errors/Page404'))
const Page405 = React.lazy(() => import('./views/pages/Errors/Page405'))
const Page500 = React.lazy(() => import('./views/pages/Errors/Page500'))

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes(
    'coreui-pro-react-admin-template-theme-default',
  )
  const storedTheme = useSelector((state: RootState) => state.ui.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    let theme = urlParams.get('theme')

    if (theme !== null && theme.match(/^[A-Za-z0-9\s]+/)) {
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
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          {/* Public routes wrapped with PublicRoute (redirects to dashboard if logged in) */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Status & Error Pages (Sin DefaultLayout) */}
          <Route path="/403" element={<Page403 />} />
          <Route path="/404" element={<Page404 />} />
          <Route path="/405" element={<Page405 />} />
          <Route path="/500" element={<Page500 />} />

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
