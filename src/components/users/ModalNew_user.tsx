import useUsers from "@/hooks/adm-user/useUsers"
import { cilExitToApp, cilLockLocked, cilLockUnlocked, cilUser } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CCol, CForm, CFormInput, CInputGroup, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from "@coreui/react-pro"

interface NewuserProps {
    userState: ReturnType<typeof useUsers>
    onUserCreated?: () => void
}

const Newuser = ({ userState, onUserCreated }: NewuserProps) => {
    const handleGuardar = async () => {
        const ok = await userState.handleCrearUsuario(userState.formData)
        if (ok) {
            userState.setModalVisible(false)
            userState.resetFormData()
            if (onUserCreated) onUserCreated()
        }
    }

    return (
        <CModal visible={userState.modalVisible} onClose={userState.handleCerrarCrear}>
            <CModalHeader>
                <CModalTitle className=" mb-1 text-body d-flex align-items-center gap-2">
                    <CIcon icon={cilUser} size="lg" className="text-body" />
                    <span>Ingreso de Nuevo Usuario</span>
                </CModalTitle>
            </CModalHeader>
            <CModalBody>
                <CForm className="row g-3" autoComplete="off">
                    <CCol md={6}>
                        <CFormInput
                            type="text"
                            id="inputNuevoUsuario"
                            name="nuevo_usuario_alias"
                            autoComplete="off"
                            label="Usuario"
                            placeholder="Usuario"
                            maxLength={25}

                            value={userState.formData.NICK_USUARIO || ''}
                            onChange={(e) => userState.setFormData({ ...userState.formData, NICK_USUARIO: e.target.value })}
                        />
                    </CCol>
                    <CCol md={6}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="form-label mb-0">Contraseña</label>
                        </div>
                        <CInputGroup>
                            <CFormInput
                                type={userState.showPassword ? 'text' : 'password'}
                                id="inputNuevaContrasena"
                                name="nueva_contrasena_cuenta"
                                autoComplete="new-password"
                                placeholder="••••••••"
                                maxLength={25}
                                value={userState.formData.PASSWORD_USUARIO || ''}
                                onChange={(e) => userState.setFormData({ ...userState.formData, PASSWORD_USUARIO: e.target.value })}
                            />
                            {userState.verContraseñaUsuario && (

                                <CButton
                                    type="button"
                                    color="secondary"
                                    variant="outline"
                                    onClick={() => userState.setShowPassword(!userState.showPassword)}
                                    title={userState.showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                >
                                    <CIcon icon={userState.showPassword ? cilLockUnlocked : cilLockLocked} />
                                </CButton>
                            )}
                        </CInputGroup>
                    </CCol>
                    <CCol xs={12}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="form-label mb-0" htmlFor="inputNuevoNombres">Nombres Completos</label>
                        </div>
                        <CFormInput
                            id="inputNuevoNombres"
                            name="nuevo_usuario_nombres"
                            autoComplete="off"
                            placeholder="Nombre Completo"
                            maxLength={25}
                            value={userState.formData.NOMBRES_USUARIO || ''}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 25)
                                userState.setFormData({ ...userState.formData, NOMBRES_USUARIO: val })
                            }}
                        />
                    </CCol>
                </CForm>
            </CModalBody>
            <CModalFooter>
                <CButton size="sm" color="secondary" className="hover:text-white shadow-sm" variant="outline" onClick={userState.handleCerrarCrear} disabled={userState.guardando}>
                    <CIcon icon={cilExitToApp} className="me-1" />
                    Cerrar
                </CButton>

                {userState.canGuardarUsuario && (
                    <CButton
                        color="success"
                        size="sm"
                        variant="outline"
                        className="hover:text-white shadow-sm"
                        onClick={handleGuardar}
                        disabled={userState.guardando}
                    >
                        <CIcon icon={cilUser} className="me-1" />
                        {userState.guardando ? <CSpinner size="sm" className="me-1" /> : null}
                        Guardar Usuario
                    </CButton>
                )}
            </CModalFooter>
        </CModal>
    )
}

export default Newuser