import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react-pro'
import routes from '@/routes'
import ProtectedRoute from '../guards/ProtectedRoute'




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
                  route.roles ? (
                    <ProtectedRoute roles={route.roles}>
                      <ElementComponent />
                    </ProtectedRoute>
                  ) : (
                    <ElementComponent />
                  )
                }
              />
            )
          })}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default AppContent
