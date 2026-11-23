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
import { CambioEstadoLibro } from '@/Service/rco/Prestamos'
import { ActualizarEstado } from '@/Service/rco/Libros'
import { usePermissions } from '@/hooks/auth/usePermissions'

interface ModalNoDevueltoProps {
  visible: boolean
  setVisible: (v: boolean) => void
  item: any | null
  onSuccess: () => void
  canNoDevuelto?: boolean
  canConfirmarDarBaja?: boolean
}

export const ModalNoDevuelto: React.FC<ModalNoDevueltoProps> = ({
  visible,
  setVisible,
  item,
  onSuccess,
  canNoDevuelto = true,
  canConfirmarDarBaja,
}) => {
  const { verificarAccionEnServidor } = usePermissions()
  const canConfirmar = canConfirmarDarBaja !== undefined ? canConfirmarDarBaja : canNoDevuelto
  const [motivo, setMotivo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (visible) {
      setMotivo('')
      setErrorMsg('')
    }
  }, [visible])

  if (!item) return null

  const idPrestamo = item.ID_PRESTAMO
  const idLibro = item.ID_LIBROS

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
        text: 'No tienes permisos para confirmar la baja del libro.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_confirmar_dar_baja')
    if (!tienePermiso) {
      setErrorMsg('No cuenta con los permisos necesarios para realizar esta acción.')
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para confirmar la baja del libro.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!idPrestamo) {
      setErrorMsg('No se pudo identificar el préstamo seleccionado.')
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
      // 1. Actualizar estado del préstamo a No Devuelto (estado 2)
      const payloadPrestamo = {
        nuevo_estado: 2,
        ID_PRESTAMO: idPrestamo,
        ID_LIBROS: idLibro,
        DETALLE_PRESTAMO: trimmedMotivo,
      }
      await CambioEstadoLibro(idPrestamo, payloadPrestamo)

      // 2. Dar de baja el libro en inventario (estado 0 + MOTIVO_BAJA_LIBRO)
      if (idLibro) {
        const payloadLibro = {
          ESTADO_LIBROS: 0,
          MOTIVO_BAJA_LIBRO: trimmedMotivo,
        }
        await ActualizarEstado(idLibro, payloadLibro)
      }

      Swal.fire({
        icon: 'success',
        title: '¡Baja registrada!',
        text: 'El libro fue registrado como Devuelto pero Dañado y dado de baja en inventario.',
        timer: 1800,
        showConfirmButton: false,
      })

      setVisible(false)
      onSuccess()
    } catch (error: any) {
      console.error('Error al registrar No Devuelto / Baja del libro:', error)
      const validationErrors = error?.response?.data?.errors
      let msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Ocurrió un error al registrar el estado del libro.'

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
      <CModalHeader closeButton className="border-bottom bg-danger bg-opacity-10 py-3">
        <CModalTitle className="d-flex align-items-center gap-2 text-danger fs-5 fw-bold">
          <CIcon icon={cilBan} />
          <span>Registrar Libro No Devuelto / Dar de Baja</span>
        </CModalTitle>
      </CModalHeader>

      <CForm onSubmit={handleSubmit}>
        <CModalBody className="p-4">
          {errorMsg && (
            <CAlert color="danger" dismissible onClose={() => setErrorMsg('')} className="mb-3 py-2 small">
              {errorMsg}
            </CAlert>
          )}


          {/* Campo de motivo de baja */}
          <CRow className="g-3">
            <CCol xs={12}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <CFormLabel className="fw-semibold small mb-0">
                  Motivo de la Baja del Libro <span className="text-danger">*</span>
                </CFormLabel>
                <span className="small text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                  {motivo.length}/255
                </span>
              </div>
              <CFormTextarea
                rows={3}
                maxLength={255}
                placeholder="Especifique el motivo de la baja del libro (máx. 255 caracteres)"
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
              disabled={guardando || !isLengthValid}
              variant="outline" className="hover:text-white shadow-sm"            >
              {guardando ? (
                <>
                  <CSpinner size="sm" />
                  <span>Procesando baja...</span>
                </>
              ) : (
                <>
                  <CIcon icon={cilBan} />
                  <span>Confirmar y Dar de Baja</span>
                </>
              )}
            </CButton>
          )}
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalNoDevuelto
