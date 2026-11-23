import { cilExitToApp, cilLockLocked, cilLockUnlocked, cilUser, cilPencil } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CInputGroup,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react-pro'
import useProfile from '@/hooks/adm-user/useProfile'

interface ModalProfileProps {
  profileState: ReturnType<typeof useProfile>
}

const ModalProfile = ({ profileState }: ModalProfileProps) => {
  if (!profileState) return null

  const isSaving = Boolean(profileState.guardando || profileState.loading)

  return (
    <CModal
      visible={profileState.modalVisible}
      onClose={() => profileState.setModalVisible(false)}
    >
      <CModalHeader>
        <CModalTitle className="mb-1 text-body d-flex align-items-center gap-2">
          <CIcon icon={cilPencil} size="lg" className="text-body" />
          <span>Actualización de Datos</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm className="row g-3">
          <CCol md={6}>
            <CFormInput
              type="text"
              label="Usuario"
              disabled
              value={profileState.formData.NICK_USUARIO || ''}
            />
          </CCol>
          <CCol md={6}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label mb-0">Contraseña</label>
            </div>
            <CInputGroup>
              <CFormInput
                type={profileState.showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                maxLength={25}
                value={profileState.formData.PASSWORD_USUARIO || ''}
                onChange={(e) =>
                  profileState.setFormData({
                    ...profileState.formData,
                    PASSWORD_USUARIO: e.target.value,
                  })
                }
              />
              <CButton
                type="button"
                color="secondary"
                variant="outline"
                onClick={() => profileState.setShowPassword(!profileState.showPassword)}
                title={profileState.showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                <CIcon icon={profileState.showPassword ? cilLockUnlocked : cilLockLocked} />
              </CButton>
            </CInputGroup>
          </CCol>
          <CCol xs={12}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label mb-0">Nombre Completo</label>
            </div>
            <CFormInput
              maxLength={25}
              placeholder="Ingrese su nombre completo (máx. 25 caracteres)"
              value={profileState.formData.NOMBRES_USUARIO || ''}
              onChange={(e) =>
                profileState.setFormData({
                  ...profileState.formData,
                  NOMBRES_USUARIO: e.target.value,
                })
              }
            />
          </CCol>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton
          color="danger"
          variant="outline"
          size="sm"
          className="hover:text-white shadow-sm"
          disabled={isSaving}
          onClick={() => profileState.setModalVisible(false)}
        >
          <CIcon icon={cilExitToApp} className="me-1" />
          Cerrar
        </CButton>

        {profileState.canGuardarPerfil && (
          <CButton
            color="success"
            variant="outline"
            size="sm"
            className="hover:text-white shadow-sm"
            disabled={isSaving}
            onClick={profileState.handleGuardar}
          >
            <CIcon icon={cilUser} className="me-1" />
            {isSaving ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </CButton>
        )}
      </CModalFooter>
    </CModal>
  )
}

export default ModalProfile
