import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CRow,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilHome } from '@coreui/icons'

export interface ErrorLayoutProps {
  statusCode: string | number
  title: string
  description: string
  icon: any
  iconColor?: string
  iconBgColor?: string
}

export const ErrorLayout: React.FC<ErrorLayoutProps> = ({
  statusCode,
  title,
  description,
  icon,
  iconColor = '#1C69A8',
  iconBgColor = 'rgba(28, 105, 168, 0.1)',
}) => {
  const navigate = useNavigate()

  return (
    <div
      className="py-5 d-flex align-items-center justify-content-center"
      style={{ minHeight: '70vh' }}
    >
      <CContainer>
        <CRow className="justify-content-center">
          <CCol xs={12} sm={10} md={8} lg={6}>
            <CCard className="border shadow-sm text-center p-4 bg-body">
              <CCardBody className="p-4 d-flex flex-column align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-4 shadow-sm"
                  style={{
                    width: '84px',
                    height: '84px',
                    backgroundColor: iconBgColor,
                    color: iconColor,
                  }}
                >
                  <CIcon icon={icon} size="xxl" />
                </div>

                <span
                  className="font-monospace fw-bold mb-2"
                  style={{ fontSize: '3rem', lineHeight: '1', color: iconColor }}
                >
                  {statusCode}
                </span>

                <h4 className="fw-bold text-body mb-2">{title}</h4>

                <p className="text-muted small mb-4 px-3" style={{ maxWidth: '440px' }}>
                  {description}
                </p>

                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  <CButton
                    color="secondary"
                    variant="outline"
                    size="sm"
                    className="d-flex align-items-center gap-2 shadow-sm"
                    onClick={() => navigate(-1)}
                  >
                    <CIcon icon={cilArrowLeft} />
                    <span>Regresar</span>
                  </CButton>
                  <CButton
                    color="primary"
                    size="sm"
                    className="d-flex align-items-center gap-2 shadow-sm text-white"
                    onClick={() => navigate('/')}
                  >
                    <CIcon icon={cilHome} />
                    <span>Ir al Inicio</span>
                  </CButton>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default ErrorLayout
