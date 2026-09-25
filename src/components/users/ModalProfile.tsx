import useUsers from "@/hooks/adm-user/useUsers"
import { cilExitToApp, cilLockLocked, cilLockUnlocked, cilUser } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CCol, CForm, CFormInput, CInputGroup, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from "@coreui/react-pro"

const ModalProfile = ({ userState }: { userState: ReturnType<typeof useUsers> }) => {
    return (
        <>
            <CModal
                visible={userState.modalVisible}
                onClose={() => userState.setModalVisible(false)}
            >
                <CModalHeader>
                    <CModalTitle className="w-100 text-center">Actualización de Datos</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm className="row g-3">
                        <CCol md={6}>
                            <CFormInput
                                type="text"
                                label="Usuario"
                                disabled
                                value={(userState.user || userState.getStoredUser())?.NICK_USUARIO || ''}
                            />
                        </CCol>
                        <CCol md={6}>
                            <label className="form-label">Contraseña</label>
                            <CInputGroup>
                                <CFormInput
                                    type={userState.showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={userState.formData.password}
                                    onChange={(e) => userState.setFormData({ ...userState.formData, password: e.target.value })}
                                />
                                <CButton
                                    type="button"
                                    color="secondary"
                                    variant="outline"
                                    onClick={() => userState.setShowPassword(!userState.showPassword)}
                                    title={userState.showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                                >
                                    <CIcon icon={userState.showPassword ? cilLockUnlocked : cilLockLocked} />
                                </CButton>
                            </CInputGroup>
                        </CCol>
                        <CCol xs={12}>
                            <CFormInput
                                label="Nombre Completo"
                                value={userState.formData.nombres}
                                onChange={(e) => userState.setFormData({ ...userState.formData, nombres: e.target.value })}
                            />
                        </CCol>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color="danger"
                        variant="outline"
                        className="hover:text-white"
                        disabled={userState.loading}
                        onClick={() => userState.setModalVisible(false)}
                    >
                        <CIcon icon={cilExitToApp} className="me-1"/>
                        Cerrar
                    </CButton>
                    <CButton
                        color="success"
                        variant="outline"
                        className="hover:text-white"
                        disabled={userState.loading}
                        onClick={userState.handleGuardar}
                    >
                        <CIcon icon={cilUser} className="me-1"/>
                        {userState.loading ? (
                            <>
                                <CSpinner size="sm" className="me-2" />
                                Guardando...
                            </>
                        ) : (
                            'Guardar Usuario'
                        )}
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}
export default ModalProfile