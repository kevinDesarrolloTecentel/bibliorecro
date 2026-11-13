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
  CSpinner,
  CAlert,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilBan, cilSave } from '@coreui/icons'
import Swal from 'sweetalert2'
import { SancionarDePorVida } from '@/Service/rco/Sanciones'
import { SancionItem } from '@/models/rco/sancion.model'
import { usePermissions } from '@/context/PermissionsContext'

interface ModalSancionarDePorVidaProps {
  visible: boolean
  setVisible: (v: boolean) => void
  item: SancionItem | any | null
  onSuccess: () => void
  canGuardarSancionPermanente?: boolean
}

export const ModalSancionarDePorVida: React.FC<ModalSancionarDePorVidaProps> = ({
  visible,
  setVisible,
  item,
  onSuccess,
  canGuardarSancionPermanente = true,
}) => {
  const { verificarAccionEnServidor } = usePermissions()
  const [motivo, setMotivo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (visible) {
      setMotivo('')
      setErrorMsg('')
    }
  }, [visible])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!canGuardarSancionPermanente) {
      setErrorMsg('No cuenta con permisos para guardar la sanción permanente.')
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para guardar la sanción permanente.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    const tienePermiso = await verificarAccionEnServidor('btn_guardar_sancion_permanente')
    if (!tienePermiso) {
      setErrorMsg('No cuenta con permisos para guardar la sanción permanente.')
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para guardar la sanción permanente.',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
      })
      return
    }

    if (!item) return

    const idPersona = item.id_persona ?? item.ID_PERSONA ?? item.raw?.ID_PERSONA
    if (!idPersona) {
      setErrorMsg('No se pudo identificar a la persona.')
      return
    }

    if (!motivo.trim()) {
      setErrorMsg('Por favor escriba el detalle o motivo de la sanción.')
      return
    }

    setGuardando(true)
    try {
      await SancionarDePorVida({
        ID_INSCRIPCION: item.ID_INSCRIPCION ?? item.raw?.ID_INSCRIPCION,
        MOTIVO_VETO: motivo.trim(),
        id_persona: idPersona,
        ID_PERSONA: idPersona,
        motivo: motivo.trim(),
        detalle: motivo.trim(),
      })

      Swal.fire({
        icon: 'success',
        title: '¡Sanción permanente!',
        text: 'El usuario fue sancionado de por vida con éxito.',
        timer: 1800,
        showConfirmButton: false,
      })

      setVisible(false)
      onSuccess()
    } catch (error: any) {
      console.error('Error al sancionar de por vida:', error)
      const data = error?.response?.data
      if (
        data?.message &&
        (data.message.toLowerCase().includes('veto permanente') ||
          data.message.toLowerCase().includes('ya tiene un veto') ||
          data.message.toLowerCase().includes('vetad'))
      ) {
        Swal.fire({
          icon: 'info',
          title: 'Usuario Ya Vetado',
          text: data.message,
          confirmButtonColor: '#0d6efd',
          confirmButtonText: 'Entendido',
        })
        setVisible(false)
        onSuccess()
        return
      }
      const msg = data?.message || error?.message || 'Ocurrió un error al registrar la sanción permanente.'
      setErrorMsg(msg)
    } finally {
      setGuardando(false)
    }
  }

  if (!item) return null

  return (
    <CModal visible={visible} onClose={() => !guardando && setVisible(false)} alignment="center">
      <CModalHeader closeButton className="border-bottom bg-danger bg-opacity-10 py-3">
        <CModalTitle className="d-flex align-items-center gap-2 text-danger fs-5 fw-bold">
          <CIcon icon={cilBan} />
          <span>Sancionar de por vida</span>
        </CModalTitle>
      </CModalHeader>

      <CForm onSubmit={handleSubmit}>
        <CModalBody className="p-4">
          {errorMsg && (
            <CAlert color="danger" dismissible onClose={() => setErrorMsg('')} className="mb-3 py-2 small">
              {errorMsg}
            </CAlert>
          )}

          <div>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <CFormLabel className="fw-semibold small mb-0">
                Detalle de la sanción <span className="text-danger">*</span>
              </CFormLabel>
              <span className="small text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                {motivo.length}/255
              </span>
            </div>
            <CFormTextarea
              rows={3}
              maxLength={255}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Escriba aquí el detalle de la sanción (máx. 255 caracteres)..."
              required
              disabled={guardando}
              autoFocus
            />
          </div>
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
          {canGuardarSancionPermanente && (
            <CButton
              color="danger"
              size="sm"
              type="submit"
              disabled={guardando}
              variant="outline" 
              className="hover:text-white shadow-sm"            >
              {guardando ? (
                <>
                  <CSpinner size="sm" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CIcon icon={cilSave} />
                  <span>Guardar Sanción</span>
                </>
              )}
            </CButton>
          )}
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

export default ModalSancionarDePorVida
