import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react-pro'
import routes from '@/routes'
import ProtectedRoute from '../guards/ProtectedRoute'
import Page403 from '@/views/pages/Errors/Page403'
import Page404 from '@/views/pages/Errors/Page404'
import { usePermissions } from '@/hooks/auth/usePermissions'

const RootRedirect = () => {
  const { canAccessPath, rutasPermitidas } = usePermissions()
  if (canAccessPath('/dashboard')) {
    return <Navigate to="/dashboard" replace />
  }
  const next = Array.from(rutasPermitidas)[0] || '/dashboard'
  return <Navigate to={next} replace />
}

const AppContent = () => {
  return (
    <CContainer lg className="px-4">
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            if (!route.element) return null
            const ElementComponent = route.element
            return (
              <Route
                key={idx}
                path={route.path}
                element={
                  <ProtectedRoute
                    requiredPermission={route.permission}
                    requiredRoles={route.roles}
                  >
                    <ElementComponent />
                  </ProtectedRoute>
                }
              />
            )
          })}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/403" element={<Page403 />} />
          <Route path="/404" element={<Page404 />} />
          <Route path="*" element={<Page404 />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default AppContent
