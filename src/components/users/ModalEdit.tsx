import useUsers from "@/hooks/adm-user/useUsers"
import { cilExitToApp, cilLockLocked, cilLockUnlocked, cilPenNib } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CCol, CForm, CFormInput, CFormSelect, CInputGroup, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from "@coreui/react-pro"

const ModalEdit = ({ userState }: { userState: ReturnType<typeof useUsers> }) => {
    return (
        <>
            <CModal visible={userState.modalEdit} onClose={() => userState.setModalEdit(false)}>
                <CModalHeader>
                    <CModalTitle>Actualización de Usuario</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm className="row g-3">
                        <CCol md={6}>
                            <CFormInput
                                type="text"
                                id="editUsuario"
                                label="Usuario"
                                disabled
                                value={userState.editFormData.usuario}
                                onChange={(e) => userState.setEditFormData({ ...userState.editFormData, usuario: e.target.value })}
                            />
                        </CCol>
                        <CCol md={6}>
                            <label className='form-label'>Contraseña</label>
                            <CInputGroup>
                                <CFormInput
                                    type={userState.showPassword ? 'text' : 'password'}
                                    placeholder='••••••••'
                                    value={userState.editFormData.password}
                                    onChange={(e) => userState.setEditFormData({ ...userState.editFormData, password: e.target.value })}
                                />
                                <CButton
                                    type='button'
                                    color='secondary'
                                    variant='outline'
                                    onClick={() => userState.setShowPassword(!userState.showPassword)}
                                    title={userState.showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                >
                                    <CIcon icon={userState.showPassword ? cilLockUnlocked : cilLockLocked} />
                                </CButton>
                            </CInputGroup>
                        </CCol>
                        <CCol xs={12}>
                            <CFormInput
                                id="editNombres"
                                label="Nombres Completos"
                                value={userState.editFormData.nombres}
                                onChange={(e) => userState.setEditFormData({ ...userState.editFormData, nombres: e.target.value })}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormSelect
                                id="editRol"
                                label="Rol"
                                value={userState.editFormData.rol}
                                onChange={(e) => userState.setEditFormData({ ...userState.editFormData, rol: e.target.value })}
                            >
                                <option value="">Elija un rol...</option>
                                {userState.rolesList.length > 0 ? (
                                    userState.rolesList.map((r: any) => {
                                        const id = String(r.ID_ROL ?? r.id ?? '')
                                        const nombre = r.NOMBRE_ROL ?? r.nombre ?? r.name ?? id
                                        return (
                                            <option key={id} value={id}>
                                                {nombre}
                                            </option>
                                        )
                                    })
                                ) : (
                                    <>
                                        <option value="1">Administrador</option>
                                        <option value="2">Bibliotecario</option>
                                    </>
                                )}
                            </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                            <CFormSelect
                                id="editEstado"
                                label="Estado"
                                value={userState.editFormData.estado}
                                onChange={(e) => userState.setEditFormData({ ...userState.editFormData, estado: e.target.value })}
                            >
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </CFormSelect>
                        </CCol>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="danger" variant="outline"className="hover:text-white" onClick={() => userState.setModalEdit(false)} disabled={userState.guardando}>
                        <CIcon icon={cilExitToApp} className="me-1"/>
                        Cancelar
                    </CButton>
                    <CButton color="success" variant="outline" className="hover:text-white" onClick={userState.handleGuardarEditar} disabled={userState.guardando}>
                        {userState.guardando ? <CSpinner size="sm" className="me-1" /> : null}
                        <CIcon icon={cilPenNib} className="me-1"/>
                        Actualizar Usuario
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default ModalEdit