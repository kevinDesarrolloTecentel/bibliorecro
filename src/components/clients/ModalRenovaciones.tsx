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
import { AceptarInscripcionNew } from '@/Service/tab/Persona'
import Swal from 'sweetalert2'
import { usePermissions } from '@/context/PermissionsContext'

export interface ModalRenovaProps {
  item: any
  onRenovado?: () => void
  canRenovar?: boolean
  canGuardarRenovacion?: boolean
}

const ModalRenova: React.FC<ModalRenovaProps> = ({
  item,
  onRenovado,
  canRenovar = true,
  canGuardarRenovacion = true,
}) => {
  const { verificarAccionEnServidor } = usePermissions()
  const [visible, setVisible] = useState(false)
  const [detalle, setDetalle] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    setDetalle('')
    setVisible(false)
  }

  const handleOpen = () => {
    setDetalle('')
    setVisible(true)
  }

  React.useEffect(() => {
    if (!visible) {
      setDetalle('')
    }
  }, [visible])

  const esInactivo =
    item?.raw?.ESTADO_PERSONA === 0 ||
    String(item?.raw?.ESTADO_PERSONA) === '0' ||
    item?.estado === 'Inactivo'

  if (!esInactivo || !canRenovar) {
    return null
  }

  const handleRenovarInscripcion = async () => {
    if (!canGuardarRenovacion) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para registrar renovaciones de usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_guardar_renovacion_gestion_usuario')
    if (!tienePermiso) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para registrar renovaciones de usuarios.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const idPersona = item.id || item.raw?.ID_PERSONA
    const idInscripcion =
      item.id_inscripcion ??
      item.raw?.ID_INSCRIPCION ??
      item.raw?.inscripciones?.[0]?.ID_INSCRIPCION ??
      item.inscripciones?.[0]?.ID_INSCRIPCION ??
      ''

    if (!idPersona) {
      Swal.fire({
        icon: 'error',
        title: 'Error de identificación',
        text: 'No se pudo identificar al usuario para la renovación.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    setLoading(true)

    try {
      await AceptarInscripcionNew({
        ID_PERSONA: idPersona,
        ID_INSCRIPCION: idInscripcion,
        DETALLE_RENOVACIONES: detalle.trim(),
      })

      setVisible(false)
      setDetalle('')

      await Swal.fire({
        icon: 'success',
        title: '¡Inscripción renovada!',
        text: 'La inscripción se renovó correctamente.',
        timer: 1800,
        showConfirmButton: false,
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
        title: 'Error al renovar',
        text: msg,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
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
        size="sm"
        className="hover:text-white shadow-sm"
        onClick={handleOpen}
      >
        <CIcon icon={cilSync} />
        <span>Renovar</span>
      </CButton>

      <CModal
        size="lg"
        alignment="center"
        backdrop="static"
        visible={visible}
        onClose={handleClose}
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
            size="sm"
            className="hover:text-white shadow-sm" onClick={handleClose}
            disabled={loading}
          >
            <CIcon icon={cilExitToApp} className="me-1" /> Cerrar
          </CButton>
          {canGuardarRenovacion && (
            <CButton
              color="success"
              size="sm"
              variant="outline"
              className="hover:text-white shadow-sm" onClick={handleRenovarInscripcion}
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
          )}
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ModalRenova