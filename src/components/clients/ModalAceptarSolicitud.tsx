import React, { useState, useEffect } from 'react'
import {
  CAlert,
  CButton,
  CCol,
  CForm,
  CFormLabel,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilColorBorder, cilExitToApp, cilCheck } from '@coreui/icons'
import Swal from 'sweetalert2'
import { PersonaRenovacion } from '@/models/tab/persona.model'

export interface ModalAceptarSolicitudProps {
  visible: boolean
  onClose: () => void
  solicitud: PersonaRenovacion | null
  detalleRenovacion: string
  setDetalleRenovacion: (val: string) => void
  onAceptar: () => void
  loading: boolean
  canActivar?: boolean
}

const ModalAceptarSolicitud: React.FC<ModalAceptarSolicitudProps> = ({
  visible,
  onClose,
  solicitud,
  detalleRenovacion,
  setDetalleRenovacion,
  onAceptar,
  loading,
  canActivar = true,
}) => {
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!visible) {
      setErrorMsg('')
    }
  }, [visible])

  const handleValidarYAceptar = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMsg('')

    if (!detalleRenovacion.trim()) {
      setErrorMsg('Por favor escriba el detalle u observaciones de la activación.')
      Swal.fire({
        icon: 'warning',
        title: 'Campo obligatorio',
        text: 'El detalle u observaciones de la activación es obligatorio. Por favor ingrese las observaciones.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    onAceptar()
  }

  const handleCloseModal = () => {
    setErrorMsg('')
    onClose()
  }

  return (
    <CModal
      size="lg"
      visible={visible}
      onClose={handleCloseModal}
      backdrop="static"
    >
      <CModalHeader closeButton className='bg-body'>
        <CModalTitle className="mb-1 text-body d-flex align-items-center gap-2">
          <CIcon icon={cilCheck} size="lg" className="text-body" />
          <span>Aceptar Solicitud</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        {errorMsg && (
          <CAlert
            color="danger"
            dismissible
            onClose={() => setErrorMsg('')}
            className="mb-3 py-2 small"
          >
            {errorMsg}
          </CAlert>
        )}

        <div className="mb-3 p-3 bg-body rounded border">
          <p className="mb-1 text-secondary">
            <strong>Usuario:</strong> {solicitud?.NOMBRE_PERSONA} {solicitud?.APELLIDO_PERSONA}
          </p>
          <p className="mb-1 text-secondary">
            <strong>Identificación:</strong> {solicitud?.IDENTIFICACION_PERSONA}
          </p>
          <p className="mb-1 text-secondary">
            <strong>Tipo:</strong> {solicitud?.tipo_usuario === 'Renovacion' ? 'Renovación' : 'Nuevo'}
          </p>
        </div>
        <CForm className="row g-3" onSubmit={handleValidarYAceptar}>
          <CCol xs={12}>
            <CFormLabel htmlFor="inputDetalleInscripcion" className="fw-semibold">
              Detalle u observaciones de la activación <span className="text-danger">*</span>:
            </CFormLabel>
            <CFormTextarea
              id="inputDetalleInscripcion"
              rows={4}
              placeholder="Ingrese notas u observaciones adicionales sobre la aprobación..."
              value={detalleRenovacion}
              onChange={(e) => {
                setDetalleRenovacion(e.target.value)
                if (errorMsg) setErrorMsg('')
              }}
              required
              disabled={loading}
              autoFocus
            />
          </CCol>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton
          size="sm"
          color="danger"
          variant="outline"
          className="hover:text-white shadow-sm"
          onClick={handleCloseModal}
          disabled={loading}
        >
          <CIcon icon={cilExitToApp} className="me-1" /> Cerrar
        </CButton>
        {canActivar && (
          <CButton
            size="sm"
            color="success"
            variant="outline"
            className="hover:text-white shadow-sm"
            onClick={handleValidarYAceptar}
            disabled={loading || detalleRenovacion.trim().length < 10}
          >
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
        )}
      </CModalFooter>
    </CModal>
  )
}

export default ModalAceptarSolicitud
