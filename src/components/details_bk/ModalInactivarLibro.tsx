import React, { useState, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormLabel,
  CFormTextarea,
  CRow,
  CCol,
  CSpinner,
  CAlert,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilBan } from '@coreui/icons'
import Swal from 'sweetalert2'
import { ActualizarEstado } from '@/Service/rco/Libros'
import { usePermissions } from '@/hooks/auth/usePermissions'

interface ModalInactivarLibroProps {
  visible: boolean
  setVisible: (v: boolean) => void
  libro: any | null
  onSuccess: () => void
  canInactivarLibro?: boolean
  canConfirmarInactivarLibro?: boolean
}

export const ModalInactivarLibro: React.FC<ModalInactivarLibroProps> = ({
  visible,
  setVisible,
  libro,
  onSuccess,
  canInactivarLibro = true,
  canConfirmarInactivarLibro,
}) => {
  const { verificarAccionEnServidor } = usePermissions()
  const canConfirmar = canConfirmarInactivarLibro !== undefined ? canConfirmarInactivarLibro : canInactivarLibro
  const [motivo, setMotivo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (visible) {
      setMotivo('')
      setErrorMsg('')
    }
  }, [visible])

  if (!libro) return null

  const idLibro = libro.ID_LIBROS

  const trimmedMotivo = motivo.trim()
  const isLengthValid = trimmedMotivo.length >= 5 && trimmedMotivo.length <= 1000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!canConfirmar) {
      setErrorMsg('No cuenta con los permisos necesarios para realizar esta acción.')
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para confirmar la inactivación del libro.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_confirmar_inactivar')
    if (!tienePermiso) {
      setErrorMsg('No cuenta con los permisos necesarios para realizar esta acción.')
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para confirmar la inactivación del libro.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!idLibro) {
      setErrorMsg('No se pudo identificar el libro seleccionado.')
      return
    }

    if (!trimmedMotivo) {
      setErrorMsg('Debes ingresar el motivo de la baja del libro.')
      return
    }

    if (trimmedMotivo.length < 5) {
      setErrorMsg('El motivo debe tener al menos 5 caracteres.')
      return
    }

    if (trimmedMotivo.length > 255) {
      setErrorMsg('El motivo no puede superar los 255 caracteres.')
      return
    }

    setGuardando(true)
    try {
      const payloadLibro = {
        ESTADO_LIBROS: 0,
        MOTIVO_BAJA_LIBRO: trimmedMotivo,
      }
      await ActualizarEstado(idLibro, payloadLibro)

      Swal.fire({
        icon: 'success',
        title: '¡Libro inactivado!',
        text: 'El libro fue inactivado correctamente.',
        timer: 1800,
        showConfirmButton: false,
      })

      setVisible(false)
      onSuccess()
    } catch (error: any) {
      console.error('Error al inactivar el libro:', error)
      const validationErrors = error?.response?.data?.errors
      let msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Ocurrió un error al actualizar el estado del libro.'

      if (validationErrors && typeof validationErrors === 'object') {
        const firstKey = Object.keys(validationErrors)[0]
        if (firstKey && Array.isArray(validationErrors[firstKey]) && validationErrors[firstKey].length > 0) {
          msg = validationErrors[firstKey][0]
        }
      }

      setErrorMsg(msg)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <CModal
      size="lg"
      visible={visible}
      onClose={() => !guardando && setVisible(false)}
      alignment="center"
      backdrop="static"
    >
      <CModalHeader closeButton className="border-bottom bg-warning bg-opacity-10 py-3">
        <CModalTitle className="d-flex align-items-center gap-2 text-warning fs-5 fw-bold">
          <CIcon icon={cilBan} />
          <span>Inactivar Libro</span>
        </CModalTitle>
      </CModalHeader>

      <CForm onSubmit={handleSubmit}>
        <CModalBody className="p-4">
          {errorMsg && (
            <CAlert color="warning" dismissible onClose={() => setErrorMsg('')} className="mb-3 py-2 small">
              {errorMsg}
            </CAlert>
          )}

          {/* Campo de motivo de baja */}
          <CRow className="g-3">
            <CCol xs={12}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <CFormLabel className="fw-semibold small mb-0">
                  Motivo de la inactivación del Libro <span className="text-danger">*</span>
                </CFormLabel>
                <span className="small text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                  {motivo.length}/255
                </span>
              </div>
              <CFormTextarea
                rows={3}
                maxLength={255}
                placeholder="Especifique el motivo de la inactivación del libro (máx. 255 caracteres)"
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value)
                  if (errorMsg) setErrorMsg('')
                }}
                disabled={guardando}
                invalid={Boolean(motivo.length > 0 && (motivo.trim().length < 5 || motivo.length > 255))}
                required
              />
              {motivo.length > 0 && motivo.trim().length < 5 && (
                <div className="text-danger small mt-1">
                  El motivo debe tener al menos 5 caracteres.
                </div>
              )}
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter className="border-top py-2 px-4 d-flex justify-content-end gap-2 bg-body">
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            onClick={() => setVisible(false)}
            disabled={guardando}
          >
            Cancelar
          </CButton>
          {canConfirmar && (
            <CButton
              color="danger"
              size="sm"
              type="submit"
              variant="outline"
              disabled={guardando || !isLengthValid}
              className="hover:text-white shadow-sm"            >
              {guardando ? (
                <>
                  <CSpinner size="sm" />
                  <span>Procesando baja...</span>
                </>
              ) : (
                <>
                  <CIcon icon={cilBan} />
                  <span>Confirmar e Inactivar</span>
                </>
              )}
            </CButton>
          )}
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalInactivarLibro
