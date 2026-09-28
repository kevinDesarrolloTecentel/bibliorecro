import React, { useState } from 'react'
import { cilExitToApp, cilSave, cilSync } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
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
import apiClient, { BACKEND_API_BASE } from '@/Service/apiClient'
import Swal from 'sweetalert2'

export interface ModalRenovaProps {
  item: any
  onRenovado?: () => void
}

const ModalRenova: React.FC<ModalRenovaProps> = ({ item, onRenovado }) => {
  const [visible, setVisible] = useState(false)
  const [detalle, setDetalle] = useState('')
  const [loading, setLoading] = useState(false)

  const esInactivo =
    item?.raw?.ESTADO_PERSONA === 0 ||
    String(item?.raw?.ESTADO_PERSONA) === '0' ||
    item?.estado === 'Inactivo'

  if (!esInactivo) {
    return null
  }

  const handleRenovarInscripcion = async () => {
    const idPersona = item.id || item.raw?.ID_PERSONA
    const idInscripcion = item.raw?.ID_INSCRIPCION ?? item.id_inscripcion ?? ''

    if (!idPersona) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo identificar al usuario para la renovación.',
      })
      return
    }

    setLoading(true)

    try {
      await apiClient.post(`${BACKEND_API_BASE}/renoacionesNew`, {
        ID_PERSONA: idPersona,
        ID_INSCRIPCION: idInscripcion,
        DETALLE_RENOVACIONES: detalle.trim(),
      })

      setVisible(false)
      setDetalle('')

      await Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Inscripción renovada con éxito.',
        confirmButtonColor: '#04833c',
      })

      if (onRenovado) {
        onRenovado()
      }
    } catch (err: any) {
      console.error('Error al renovar inscripción:', err)
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Hubo un error al renovar la inscripción.'
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: msg,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <CButton
        color="warning"
        variant="outline"
        className="hover:text-white d-flex align-items-center gap-1 shadow-sm"
        onClick={() => setVisible(true)}
      >
        <CIcon icon={cilSync} />
        <span>Renovar</span>
      </CButton>

      <CModal
        size="lg"
        alignment="center"
        backdrop="static"
        visible={visible}
        onClose={() => setVisible(false)}
      >
        <CModalHeader>
          <CModalTitle>Renovar Inscripción</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3 p-3 bg-body rounded border">
            <div className="fw-semibold text-body">
              {item.nombre} {item.apellido}
            </div>
            <div className="text-muted small font-monospace">
              Identificación: {item.identificacion || item.raw?.IDENTIFICACION_PERSONA || '-'}
            </div>
          </div>
          <CForm className="row g-3">
            <div className="col-12">
              <CFormLabel htmlFor="inputDetalleInscripcion" className="fw-semibold">
                Detalle de la Renovación:
              </CFormLabel>
              <CFormTextarea
                id="inputDetalleInscripcion"
                rows={3}
                placeholder="Ingrese detalles u observaciones de la renovación..."
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
              />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="danger"
            variant="outline"
            className='hover:text-white'
            onClick={() => setVisible(false)}
            disabled={loading}
          >
            <CIcon icon={cilExitToApp} className="me-1" /> Cerrar
          </CButton>
          <CButton
            color="success"
            variant="outline"
            className='hover:text-white'
            onClick={handleRenovarInscripcion}
            disabled={loading}
          >
            {loading ? (
              <>
                <CSpinner size="sm" className="me-1" />
                <span>Renovando...</span>
              </>
            ) : (
              <>
                <CIcon icon={cilSave} className="me-1" /> Guardar Renovación
              </>
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ModalRenova