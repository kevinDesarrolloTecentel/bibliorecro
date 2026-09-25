import React from 'react'
import {
  CButton,
  CCol,
  CForm,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilColorBorder, cilExitToApp} from '@coreui/icons'
import { PersonaRenovacion } from '@/hooks/tab-persona/useRenovaciones'

export interface ModalAceptarSolicitudProps {
  visible: boolean
  onClose: () => void
  solicitud: PersonaRenovacion | null
  detalleRenovacion: string
  setDetalleRenovacion: (val: string) => void
  onAceptar: () => void
  loading: boolean
}

const ModalAceptarSolicitud: React.FC<ModalAceptarSolicitudProps> = ({
  visible,
  onClose,
  solicitud,
  detalleRenovacion,
  setDetalleRenovacion,
  onAceptar,
  loading,
}) => {
  return (
    <CModal 
    size="lg"  
    visible={visible} 
    onClose={onClose} 
    backdrop="static"
    >
      <CModalHeader closeButton className='bg-body'>
        <CModalTitle className='d-flex align-items-center gap-2 fs-5 fw-bold'>
          Aceptar Solicitud
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div className="mb-3">
          <p className="mb-1 text-secondary">
            <strong>Usuario:</strong> {solicitud?.NOMBRE_PERSONA} {solicitud?.APELLIDO_PERSONA}
          </p>
          <p className="mb-1 text-secondary">
            <strong>Identificación:</strong> {solicitud?.IDENTIFICACION_PERSONA}
          </p>
          <p className="mb-1 text-secondary">
            <strong>Tipo:</strong> {solicitud?.tipo_usuario === 'Renovacion' ? 'Renovación de carnet' : 'Nuevo registro'}
          </p>
        </div>
        <CForm className="row g-3">
          <CCol xs={12}>
            <CFormTextarea
              id="inputDetalleInscripcion"
              label="Detalle u observaciones de la activación:"
              rows={4}
              placeholder="Ingrese notas u observaciones adicionales sobre la aprobación..."
              value={detalleRenovacion}
              onChange={(e) => setDetalleRenovacion(e.target.value)}
            />
          </CCol>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="danger" variant="outline" className='hover:text-white' onClick={onClose} disabled={loading}>
          <CIcon icon={cilExitToApp} className="me-1" /> Cerrar
        </CButton>
        <CButton color="success" variant="outline" className='hover:text-white' onClick={onAceptar} disabled={loading}>
          {loading ? (
            <>
              <CSpinner size="sm" className="me-1" />
              Activando...
            </>
          ) : (
            <>
              <CIcon icon={cilColorBorder} className="me-1" /> Activar
            </>
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ModalAceptarSolicitud
