import useRoles from '@/hooks/admin-roles/useRoles'
import { cilExitToApp, cilPlus } from '@coreui/icons'
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

const ModalCreate = ({ userState }: { userState: ReturnType<typeof useRoles> }) => {
  const nombreLimpio = String(userState.formData.NOMBRE_ROL || '').trim()
  const nombreDuplicado = Boolean(
    nombreLimpio &&
      userState.roles.some((r) => {
        const rNombre = String(r.NOMBRE_ROL || '').trim().toLowerCase()
        return rNombre === nombreLimpio.toLowerCase()
      }),
  )

  const nombreLength = String(userState.formData.NOMBRE_ROL || '').length

  return (
    <CModal visible={userState.modalCrear} onClose={userState.handleCerrarCrear}>
      <CModalHeader>
        <CModalTitle className="mb-1 text-body d-flex align-items-center gap-2">
          <CIcon icon={cilPlus} size="lg" className="text-body" />
          <span>Crear Nuevo Rol</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm className="row g-3">
          <CCol xs={12}>
            <CFormInput
              type="text"
              id="inputNombreRol"
              label="Nombre del Rol *"
              maxLength={25}
              placeholder="Ej. Administrador, Bibliotecario, Supervisor..."
              value={userState.formData.NOMBRE_ROL || ''}
              invalid={nombreDuplicado || nombreLength > 25}
              feedbackInvalid={
                nombreLength > 25
                  ? 'El nombre del rol no puede superar los 25 caracteres.'
                  : 'Ya existe un rol registrado con este nombre.'
              }
              onChange={(e) =>
                userState.setFormData({
                  ...userState.formData,
                  NOMBRE_ROL: e.target.value.slice(0, 25),
                })
              }
            />
          </CCol>
          <CCol xs={12}>
            <CFormInput
              type="number"
              id="inputNivelRol"
              label="Nivel del Rol *"
              min={1}
              max={100}
              placeholder="1"
              value={userState.formData.NIVEL_ROL ?? 2}
              onChange={(e) =>
                userState.setFormData({
                  ...userState.formData,
                  NIVEL_ROL: Number(e.target.value),
                })
              }
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
          onClick={userState.handleCerrarCrear}
          disabled={userState.guardando}
        >
          <CIcon icon={cilExitToApp} className="me-1" />
          Cancelar
        </CButton>
        {userState.canGuardarRol && (
          <CButton
            size="sm"
            color="success"
            variant="outline"
            className="hover:text-white shadow-sm"
            onClick={userState.handleGuardarRol}
            disabled={userState.guardando || nombreDuplicado || !nombreLimpio}
          >
            <CIcon icon={cilPlus} className="me-1" />
            {userState.guardando ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              'Guardar Rol'
            )}
          </CButton>
        )}
      </CModalFooter>
    </CModal>
  )
}

export default ModalCreate
