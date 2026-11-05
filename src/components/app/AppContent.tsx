import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react-pro'
import routes from '@/routes'
import ProtectedRoute from '../guards/ProtectedRoute'
import NotFoundRedirect from '../guards/NotFoundRedirect'




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
                  <ProtectedRoute>
                    <ElementComponent />
                  </ProtectedRoute>
                }
              />
            )
          })}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundRedirect />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default AppContent
