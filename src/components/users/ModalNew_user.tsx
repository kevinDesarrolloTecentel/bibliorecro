
import useUsers from "@/hooks/adm-user/useUsers"
import { cilExitToApp, cilUser } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import { CButton, CCol, CForm, CFormInput, CFormSelect, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from "@coreui/react-pro"

const Newuser = ({ userState }: { userState: ReturnType<typeof useUsers> }) => {

    return (
        <>
            <CModal visible={userState.modalVisible} onClose={() => userState.setModalVisible(false)}>
                <CModalHeader>
                    <CModalTitle>Ingreso de Nuevo Usuario</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm className="row g-3">
                        <CCol md={6}>
                            <CFormInput
                                type="text"
                                id="inputUsuario"
                                label="Usuario"
                                value={userState.formData.usuario}
                                onChange={(e) => userState.setFormData({ ...userState.formData, usuario: e.target.value })}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormInput
                                type="password"
                                id="inputPassword"
                                label="Contraseña"
                                value={userState.formData.password}
                                onChange={(e) => userState.setFormData({ ...userState.formData, password: e.target.value })}
                            />
                        </CCol>
                        <CCol xs={12}>
                            <CFormInput
                                id="inputNombres"
                                label="Nombres Completos"
                                value={userState.formData.nombres}
                                onChange={(e) => userState.setFormData({ ...userState.formData, nombres: e.target.value })}
                            />
                        </CCol>
                        <CCol md={6}>
                            <CFormSelect
                                id="inputRol"
                                label="Rol"
                                value={userState.formData.rol}
                                onChange={(e) => userState.setFormData({ ...userState.formData, rol: e.target.value })}
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
                                id="inputEstado"
                                label="Estado"
                                value={userState.formData.estado}
                                onChange={(e) => userState.setFormData({ ...userState.formData, estado: e.target.value })}
                            >
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </CFormSelect>
                        </CCol>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="danger" variant="outline" className="hover:text-white" onClick={() => userState.setModalVisible(false)} disabled={userState.guardando}>
                        <CIcon icon={cilExitToApp} className="me-1"/>
                        Cerrar
                    </CButton>
                    <CButton color="success" variant="outline" className="hover:text-white" onClick={userState.handleGuardarUsuario} disabled={userState.guardando}>
                        <CIcon icon={cilUser} className="me-1"/>
                        {userState.guardando ? <CSpinner size="sm" className="me-1" /> : null}
                        Guardar Usuario
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default Newuser