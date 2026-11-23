import { useState } from 'react'
import useRoles from '@/hooks/admin-roles/useRoles'
import { cilExitToApp, cilTrash, cilPencil } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react-pro'

const ModalRolActu = ({ userState }: { userState: ReturnType<typeof useRoles> }) => {
  const [actionLoading, setActionLoading] = useState<'actualizar' | 'eliminar' | null>(null)

  const isBusy = userState.guardando || actionLoading !== null

  const nombreLimpio = String(userState.editFormData.NOMBRE_ROL || '').trim()
  const nombreDuplicado = Boolean(
    nombreLimpio &&
      userState.roles.some((r) => {
        const rId = String(r.ID_ROL ?? '')
        const rNombre = String(r.NOMBRE_ROL || '').trim().toLowerCase()
        return rId !== String(userState.editFormData.ID_ROL) && rNombre === nombreLimpio.toLowerCase()
      }),
  )

  const nombreLength = String(userState.editFormData.NOMBRE_ROL || '').length

  const handleActualizar = async () => {
    if (nombreDuplicado || !nombreLimpio) return
    setActionLoading('actualizar')
    try {
      await userState.handleActualizarRol()
    } finally {
      setActionLoading(null)
    }
  }

  const handleEliminar = async () => {
    if (!userState.editFormData.ID_ROL) return
    setActionLoading('eliminar')
    try {
      await userState.handleEliminarRol(
        userState.editFormData.ID_ROL,
        userState.editFormData.NOMBRE_ROL || undefined,
      )
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <CModal visible={userState.modalEditar} onClose={userState.handleCerrarEditar}>
      <CModalHeader>
        <CModalTitle className="mb-1 text-body d-flex align-items-center gap-2">
          <CIcon icon={cilPencil} size="lg" className="text-body" />
          <span>Actualizar o Eliminar Rol</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm className="row g-3">
          <CCol xs={12}>
            <CFormInput
              type="text"
              id="editNombreRol"
              label="Nombre del Rol *"
              maxLength={25}
              value={userState.editFormData.NOMBRE_ROL || ''}
              invalid={nombreDuplicado || nombreLength > 25}
              feedbackInvalid={
                nombreLength > 25
                  ? 'El nombre del rol no puede superar los 25 caracteres.'
                  : 'Ya existe otro rol registrado con este nombre.'
              }
              onChange={(e) =>
                userState.setEditFormData({
                  ...userState.editFormData,
                  NOMBRE_ROL: e.target.value.slice(0, 25),
                })
              }
            />
          </CCol>
          <CCol xs={12}>
            <CFormInput
              type="number"
              id="editNivelRol"
              label="Nivel del Rol *"
              min={1}
              max={100}
              value={userState.editFormData.NIVEL_ROL ?? 2}
              onChange={(e) =>
                userState.setEditFormData({
                  ...userState.editFormData,
                  NIVEL_ROL: Number(e.target.value),
                })
              }
            />
          </CCol>
        </CForm>
      </CModalBody>
      <CModalFooter className="d-flex justify-content-between">
        <div>
          {userState.canEliminarRol && Number(userState.editFormData.NIVEL_ROL) !== 1 && (
            <CButton
              size="sm"
              color="danger"
              variant="outline"
              className="hover:text-white shadow-sm"
              onClick={handleEliminar}
              disabled={isBusy}
            >
              <CIcon icon={cilTrash} className="me-1" />
              {actionLoading === 'eliminar' ? (
                <>
                  <CSpinner size="sm" className="me-1" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </CButton>
          )}
        </div>

        <div className="d-flex gap-2">
          <CButton
            size="sm"
            color="secondary"
            variant="outline"
            className="shadow-sm"
            onClick={userState.handleCerrarEditar}
            disabled={isBusy}
          >
            <CIcon icon={cilExitToApp} className="me-1" />
            Cancelar
          </CButton>

          {userState.canActualizarRol && (
            <CButton
              size="sm"
              color="primary"
              variant="outline"
              className="shadow-sm"
              onClick={handleActualizar}
              disabled={isBusy || nombreDuplicado || !nombreLimpio}
            >
              <CIcon icon={cilPencil} className="me-1" />
              {actionLoading === 'actualizar' ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </CButton>
          )}
        </div>
      </CModalFooter>
    </CModal>
  )
}

export default ModalRolActu
