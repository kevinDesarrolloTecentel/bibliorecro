import React, { useState } from 'react'
import { cilExitToApp, cilSave, cilSync } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CAlert,
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
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    setDetalle('')
    setErrorMsg('')
    setVisible(false)
  }

  const handleOpen = () => {
    setDetalle('')
    setErrorMsg('')
    setVisible(true)
  }

  React.useEffect(() => {
    if (!visible) {
      setDetalle('')
      setErrorMsg('')
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
    setErrorMsg('')

    if (!canGuardarRenovacion) {
      setErrorMsg('No tienes permisos para registrar renovaciones de usuarios.')
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
      setErrorMsg('No tienes permisos para registrar renovaciones de usuarios.')
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
      setErrorMsg('No se pudo identificar al usuario para la renovación.')
      Swal.fire({
        icon: 'error',
        title: 'Error de identificación',
        text: 'No se pudo identificar al usuario para la renovación.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!detalle.trim()) {
      setErrorMsg('Por favor escriba el detalle u observaciones de la renovación.')
      Swal.fire({
        icon: 'warning',
        title: 'Campo obligatorio',
        text: 'El detalle de la renovación es obligatorio. Por favor ingrese las observaciones.',
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
      setErrorMsg('')

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
      setErrorMsg(msg)
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
          <CModalTitle className="mb-1 text-body d-flex align-items-center gap-2">
            <CIcon icon={cilSync} size="lg" className="text-body" />
            <span>Renovar Inscripción</span>
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
            <div className="fw-semibold text-body">
              {item.nombre} {item.apellido}
            </div>
            <div className="text-muted small font-monospace">
              Identificación: {item.identificacion || item.raw?.IDENTIFICACION_PERSONA || '-'}
            </div>
          </div>
          <CForm
            className="row g-3"
            onSubmit={(e) => {
              e.preventDefault()
              handleRenovarInscripcion()
            }}
          >
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <CFormLabel htmlFor="inputDetalleInscripcion" className="fw-semibold mb-0">
                  Detalle de la Renovación <span className="text-danger">*</span>:
                </CFormLabel>
                <span className="small text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                  {detalle.length}/255
                </span>
              </div>
              <CFormTextarea
                id="inputDetalleInscripcion"
                rows={3}
                maxLength={255}
                placeholder="Ingrese detalles u observaciones de la renovación (máx. 255 caracteres)..."
                value={detalle}
                onChange={(e) => {
                  setDetalle(e.target.value)
                  if (errorMsg) setErrorMsg('')
                }}
                required
                disabled={loading}
                autoFocus
              />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="danger"
            variant="outline"
            size="sm"
            className="hover:text-white shadow-sm"
            onClick={handleClose}
            disabled={loading}
          >
            <CIcon icon={cilExitToApp} className="me-1" /> Cerrar
          </CButton>
          {canGuardarRenovacion && (
            <CButton
              color="success"
              size="sm"
              variant="outline"
              className="hover:text-white shadow-sm"
              onClick={handleRenovarInscripcion}
              disabled={loading || detalle.trim().length < 10}            >
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