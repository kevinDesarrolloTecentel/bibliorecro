import useProfile from "@/hooks/adm-user/useProfile"
import { cilExitToApp, cilLockLocked, cilLockUnlocked, cilUser,cilPencil } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CCol, CForm, CFormInput, CInputGroup, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from "@coreui/react-pro"

interface ModalProfileProps {
    profileState?: ReturnType<typeof useProfile>
}

const ModalProfile = ({ profileState }: ModalProfileProps) => {
    const state = profileState
    if (!state) return null

    const usuarioNick = state.currentUser?.NICK_USUARIO || state.formData?.usuario || ''
    const isSaving = Boolean(state.guardando || state.loading)

    return (
        <CModal
            visible={state.modalVisible}
            onClose={() => state.setModalVisible(false)}
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
                            value={usuarioNick}
                        />
                    </CCol>
                    <CCol md={6}>
                        <label className="form-label">Contraseña</label>
                        <CInputGroup>
                            <CFormInput
                                type={state.showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={state.formData.password}
                                onChange={(e) => state.setFormData({ ...state.formData, password: e.target.value })}
                            />
                            <CButton
                                type="button"
                                color="secondary"
                                variant="outline"
                                onClick={() => state.setShowPassword(!state.showPassword)}
                                title={state.showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                            >
                                <CIcon icon={state.showPassword ? cilLockUnlocked : cilLockLocked} />
                            </CButton>
                        </CInputGroup>
                    </CCol>
                    <CCol xs={12}>
                        <CFormInput
                            label="Nombre Completo"
                            value={state.formData.nombres}
                            onChange={(e) => state.setFormData({ ...state.formData, nombres: e.target.value })}
                        />
                    </CCol>
                </CForm>
            </CModalBody>
            <CModalFooter>
                <CButton
                    color="danger"
                    variant="outline"
                    size="sm"
                    className="hover:text-white shadow-sm" disabled={isSaving}
                    onClick={() => state.setModalVisible(false)}
                >
                    <CIcon icon={cilExitToApp} className="me-1" />
                    Cerrar
                </CButton>

                {state.canGuardarPerfil && (
                    <CButton
                        color="success"
                        variant="outline"
                        size="sm"
                        className="hover:text-white shadow-sm" disabled={isSaving}
                        onClick={state.handleGuardar}
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